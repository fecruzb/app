// All auth data access goes through here — endpoints and service never write SQL.
import { and, desc, eq, gt, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { tenants } from "@/domains/tenant/schema";
import {
  actionTokens,
  apiKeys,
  sessions,
  users,
  type ActionTokenPurpose,
  type ApiKey,
  type User,
} from "./schema";

export type ApiKeyPrincipal = {
  keyId: string;
  userId: string;
  userName: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
};

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
  // -- users ---------------------------------------------------------------

  async findUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user ?? null;
  },

  async findUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ?? null;
  },

  async insertUser(values: {
    name: string;
    email: string;
    passwordHash: string;
    emailVerifiedAt?: Date;
  }): Promise<User> {
    const [user] = await db.insert(users).values(values).returning();
    return user;
  },

  async updateUser(
    id: string,
    patch: Partial<Pick<User, "name" | "passwordHash" | "emailVerifiedAt">>,
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  },

  // -- sessions ------------------------------------------------------------

  async insertSession(values: { tokenHash: string; userId: string; expiresAt: Date }) {
    await db.insert(sessions).values(values);
  },

  async findSessionUser(tokenHash: string): Promise<User | null> {
    const [row] = await db
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())));
    return row?.user ?? null;
  },

  async deleteSessionByTokenHash(tokenHash: string) {
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  },

  /** Deletes the user's sessions; exceptTokenHash keeps the current one. */
  async deleteUserSessions(userId: string, exceptTokenHash?: string) {
    const where = exceptTokenHash
      ? and(eq(sessions.userId, userId), ne(sessions.tokenHash, exceptTokenHash))
      : eq(sessions.userId, userId);
    await db.delete(sessions).where(where);
  },

  // -- action tokens (email verification / password reset) ------------------

  async replaceActionToken(values: {
    userId: string;
    purpose: ActionTokenPurpose;
    tokenHash: string;
    expiresAt: Date;
  }) {
    // One valid token per user/purpose at a time
    await db
      .delete(actionTokens)
      .where(and(eq(actionTokens.userId, values.userId), eq(actionTokens.purpose, values.purpose)));
    await db.insert(actionTokens).values(values);
  },

  /** Validates and consumes (deletes) the token; returns the userId or null. */
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

  // -- api keys ------------------------------------------------------------

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

  async deleteApiKey(userId: string, keyId: string): Promise<void> {
    await db.delete(apiKeys).where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));
  },

  /** Resolves a key hash to its principal (user + tenant), or null. */
  async findApiKeyPrincipal(tokenHash: string): Promise<ApiKeyPrincipal | null> {
    const [row] = await db
      .select({
        keyId: apiKeys.id,
        userId: users.id,
        userName: users.name,
        tenantId: tenants.id,
        tenantName: tenants.name,
        tenantSlug: tenants.slug,
      })
      .from(apiKeys)
      .innerJoin(users, eq(users.id, apiKeys.userId))
      .innerJoin(tenants, eq(tenants.id, apiKeys.tenantId))
      .where(eq(apiKeys.tokenHash, tokenHash));
    return row ?? null;
  },

  async touchApiKey(keyId: string): Promise<void> {
    await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, keyId));
  },
};
