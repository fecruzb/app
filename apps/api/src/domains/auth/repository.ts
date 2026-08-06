/**
 * Auth repository
 *
 * Owns every SQL touch of users, sessions, action tokens and API keys.
 * Endpoints and services never write SQL here. Entity-prefixed methods;
 * queries are written inline. Returns rows / join shapes — map to DTOs in
 * `dto.ts` when exposing over HTTP.
 */
import { and, desc, eq, gt, ne } from "drizzle-orm";
import type { TenantRole } from "@app/shared";
import { db } from "@/db/client";
import { tenantMembers, tenants } from "@/domains/tenant/schema";
import {
  actionTokens,
  apiKeys,
  sessions,
  users,
  type ActionTokenPurpose,
  type ApiKey,
  type User,
} from "./schema";

/** Resolved API key principal (user + tenant + active membership role). */
export type ApiKeyPrincipal = {
  keyId: string;
  userId: string;
  userName: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  role: TenantRole;
};

/** API key row with the owning tenant's name joined in. */
export type ApiKeyWithTenant = {
  id: string;
  name: string;
  prefix: string;
  tenantId: string;
  tenantName: string;
  lastUsedAt: Date | null;
  createdAt: Date;
};

export const authRepository = {
  /**
   * Find a user by email
   *
   * Returns null if no user matches.
   *
   * @param email - User email
   * @returns The user row, or null
   */
  async findUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user ?? null;
  },

  /**
   * Find a user by id
   *
   * Returns null if no user matches.
   *
   * @param id - User id
   * @returns The user row, or null
   */
  async findUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ?? null;
  },

  /**
   * Insert a user
   *
   * Returns the new row.
   *
   * @param values - New user fields
   * @param values.name - Display name
   * @param values.email - Unique email
   * @param values.passwordHash - Hashed password
   * @param values.emailVerifiedAt - Optional verification timestamp
   * @returns The inserted user row
   */
  async insertUser(values: {
    name: string;
    email: string;
    passwordHash: string;
    emailVerifiedAt?: Date;
    isPlatformAdmin?: boolean;
  }): Promise<User> {
    const [user] = await db.insert(users).values(values).returning();
    return user;
  },

  /**
   * Update a user
   *
   * Patches the given fields and returns the row.
   *
   * @param id - User id
   * @param patch - Fields to update
   * @param patch.name - Display name
   * @param patch.passwordHash - Hashed password
   * @param patch.emailVerifiedAt - Verification timestamp
   * @param patch.isPlatformAdmin - Platform admin flag
   * @returns The updated user row
   */
  async updateUser(
    id: string,
    patch: Partial<Pick<User, "name" | "passwordHash" | "emailVerifiedAt" | "isPlatformAdmin">>,
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  },

  /**
   * Insert a session
   *
   * Persists the token hash; no row returned.
   *
   * @param values - New session fields
   * @param values.tokenHash - Hashed session token
   * @param values.userId - Session owner
   * @param values.expiresAt - Expiry timestamp
   */
  async insertSession(values: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
  }): Promise<void> {
    await db.insert(sessions).values(values);
  },

  /**
   * Find the user for a session
   *
   * Resolves a live session hash to its user, or null if expired / missing.
   *
   * @param tokenHash - Hashed session token
   * @returns The session user, or null
   */
  async findSessionUser(tokenHash: string): Promise<User | null> {
    const [row] = await db
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())));
    return row?.user ?? null;
  },

  /**
   * Delete a session
   *
   * Removes the row matching the token hash.
   *
   * @param tokenHash - Hashed session token
   */
  async deleteSessionByTokenHash(tokenHash: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  },

  /**
   * Delete a user's sessions
   *
   * `exceptTokenHash` keeps the current session when provided.
   *
   * @param userId - User whose sessions to clear
   * @param exceptTokenHash - Optional session hash to keep
   */
  async deleteUserSessions(userId: string, exceptTokenHash?: string): Promise<void> {
    const where = exceptTokenHash
      ? and(eq(sessions.userId, userId), ne(sessions.tokenHash, exceptTokenHash))
      : eq(sessions.userId, userId);
    await db.delete(sessions).where(where);
  },

  /**
   * Replace an action token
   *
   * Keeps one valid token per user/purpose (delete then insert).
   *
   * @param values - New action token fields
   * @param values.userId - Token owner
   * @param values.purpose - Verification or password-reset purpose
   * @param values.tokenHash - Hashed action token
   * @param values.expiresAt - Expiry timestamp
   */
  async replaceActionToken(values: {
    userId: string;
    purpose: ActionTokenPurpose;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await db
      .delete(actionTokens)
      .where(and(eq(actionTokens.userId, values.userId), eq(actionTokens.purpose, values.purpose)));
    await db.insert(actionTokens).values(values);
  },

  /**
   * Consume an action token
   *
   * Validates and deletes it; returns the userId or null.
   *
   * @param tokenHash - Hashed action token
   * @param purpose - Expected purpose
   * @returns The owning user id, or null if invalid / expired
   */
  async consumeActionToken(tokenHash: string, purpose: ActionTokenPurpose): Promise<string | null> {
    const [row] = await db
      .select()
      .from(actionTokens)
      .where(
        and(
          eq(actionTokens.tokenHash, tokenHash),
          eq(actionTokens.purpose, purpose),
          gt(actionTokens.expiresAt, new Date()),
        ),
      );
    if (!row) return null;
    await db.delete(actionTokens).where(eq(actionTokens.id, row.id));
    return row.userId;
  },

  /**
   * Insert an API key
   *
   * Returns the new row.
   *
   * @param values - New API key fields
   * @param values.userId - Key owner
   * @param values.tenantId - Tenant the key is scoped to
   * @param values.name - Display name
   * @param values.tokenHash - Hashed secret
   * @param values.prefix - Public prefix shown in the UI
   * @returns The inserted API key row
   */
  async insertApiKey(values: {
    userId: string;
    tenantId: string;
    name: string;
    tokenHash: string;
    prefix: string;
  }): Promise<ApiKey> {
    const [key] = await db.insert(apiKeys).values(values).returning();
    return key;
  },

  /**
   * List API keys
   *
   * Newest first for the user, with tenant name joined.
   *
   * @param userId - Key owner
   * @returns API keys with tenant names, newest first
   */
  async listApiKeys(userId: string): Promise<ApiKeyWithTenant[]> {
    return db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        prefix: apiKeys.prefix,
        tenantId: apiKeys.tenantId,
        tenantName: tenants.name,
        lastUsedAt: apiKeys.lastUsedAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .innerJoin(tenants, eq(tenants.id, apiKeys.tenantId))
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  },

  /**
   * Delete an API key
   *
   * Only removes a key owned by the given user.
   *
   * @param userId - Key owner
   * @param keyId - API key id
   */
  async deleteApiKey(userId: string, keyId: string): Promise<void> {
    await db.delete(apiKeys).where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));
  },

  /**
   * Delete API keys for a user in a tenant
   *
   * Revokes every key the user issued for that tenant (e.g. after leaving).
   *
   * @param userId - Key owner
   * @param tenantId - Tenant the keys were scoped to
   */
  async deleteApiKeysForTenantUser(userId: string, tenantId: string): Promise<void> {
    await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.userId, userId), eq(apiKeys.tenantId, tenantId)));
  },

  /**
   * Find an API key principal
   *
   * Resolves a key hash to user + tenant only when the user still has an active
   * membership in that tenant. Returns null otherwise.
   *
   * @param tokenHash - Hashed API key secret
   * @returns Principal fields including membership role, or null
   */
  async findApiKeyPrincipal(tokenHash: string): Promise<ApiKeyPrincipal | null> {
    const [row] = await db
      .select({
        keyId: apiKeys.id,
        userId: users.id,
        userName: users.name,
        tenantId: tenants.id,
        tenantName: tenants.name,
        tenantSlug: tenants.slug,
        role: tenantMembers.role,
      })
      .from(apiKeys)
      .innerJoin(users, eq(users.id, apiKeys.userId))
      .innerJoin(tenants, eq(tenants.id, apiKeys.tenantId))
      .innerJoin(
        tenantMembers,
        and(eq(tenantMembers.userId, apiKeys.userId), eq(tenantMembers.tenantId, apiKeys.tenantId)),
      )
      .where(eq(apiKeys.tokenHash, tokenHash));
    return row ?? null;
  },

  /**
   * Touch an API key
   *
   * Bumps `lastUsedAt` for the key.
   *
   * @param keyId - API key id
   */
  async touchApiKey(keyId: string): Promise<void> {
    await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, keyId));
  },
};
