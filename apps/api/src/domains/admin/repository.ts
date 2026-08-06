/**
 * Admin repository
 *
 * Cross-tenant SQL for the platform admin area. Only called from admin routes
 * gated by `requirePlatformAdmin` (except public join lookups by token hash).
 * Returns rows / join shapes — map in `dto.ts`.
 */
import { and, asc, count, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { users, type User } from "@/domains/auth/schema";
import { tenantMembers, tenants, type Tenant } from "@/domains/tenant/schema";
import { platformInvites, type PlatformInvite } from "./schema";

/** User row plus how many tenants they belong to. */
export type UserWithTenantCount = {
  user: User;
  tenantCount: number;
};

/** Tenant row plus member count. */
export type TenantWithMemberCount = {
  tenant: Tenant;
  memberCount: number;
};

/** Platform invite plus inviter display name. */
export type PlatformInviteWithInviter = {
  invite: PlatformInvite;
  inviterName: string | null;
};

export const adminRepository = {
  /**
   * List all users
   *
   * Newest first, with a count of tenant memberships.
   *
   * @returns Users with tenant counts
   */
  async listUsers(): Promise<UserWithTenantCount[]> {
    const rows = await db
      .select({
        user: users,
        tenantCount: sql<number>`cast(count(${tenantMembers.tenantId}) as int)`,
      })
      .from(users)
      .leftJoin(tenantMembers, eq(tenantMembers.userId, users.id))
      .groupBy(users.id)
      .orderBy(desc(users.createdAt));
    return rows;
  },

  /**
   * Set platform admin flag
   *
   * @param userId - User id
   * @param isPlatformAdmin - New flag value
   * @returns The updated user row, or null if missing
   */
  async setPlatformAdmin(userId: string, isPlatformAdmin: boolean): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ isPlatformAdmin, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user ?? null;
  },

  /**
   * List all tenants
   *
   * Oldest first, with member counts.
   *
   * @returns Tenants with member counts
   */
  async listTenants(): Promise<TenantWithMemberCount[]> {
    const rows = await db
      .select({
        tenant: tenants,
        memberCount: count(tenantMembers.userId),
      })
      .from(tenants)
      .leftJoin(tenantMembers, eq(tenantMembers.tenantId, tenants.id))
      .groupBy(tenants.id)
      .orderBy(asc(tenants.createdAt));
    return rows.map((row) => ({
      tenant: row.tenant,
      memberCount: Number(row.memberCount),
    }));
  },

  /**
   * Find a tenant by id
   *
   * @param tenantId - Tenant id
   * @returns The tenant row, or null
   */
  async findTenant(tenantId: string): Promise<Tenant | null> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
    return tenant ?? null;
  },

  /**
   * Update tenant name and/or slug
   *
   * @param tenantId - Tenant id
   * @param patch - Fields to change
   * @returns The updated tenant row, or null if missing
   */
  async updateTenant(
    tenantId: string,
    patch: { name?: string; slug?: string },
  ): Promise<Tenant | null> {
    const [tenant] = await db
      .update(tenants)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(tenants.id, tenantId))
      .returning();
    return tenant ?? null;
  },

  /**
   * List pending platform invites
   *
   * Non-expired invites, newest first.
   *
   * @returns Pending invites with inviter name
   */
  async listPendingPlatformInvites(): Promise<PlatformInviteWithInviter[]> {
    return db
      .select({ invite: platformInvites, inviterName: users.name })
      .from(platformInvites)
      .leftJoin(users, eq(users.id, platformInvites.invitedBy))
      .where(gt(platformInvites.expiresAt, new Date()))
      .orderBy(desc(platformInvites.createdAt));
  },

  /**
   * Delete platform invites by email
   *
   * Clears pending invites so there is one active invite per email.
   *
   * @param email - Invitee email
   */
  async deletePlatformInvitesByEmail(email: string): Promise<void> {
    await db.delete(platformInvites).where(eq(platformInvites.email, email));
  },

  /**
   * Insert a platform invite
   *
   * @param values - New invite fields
   * @returns The inserted invite row
   */
  async insertPlatformInvite(values: {
    email: string;
    tokenHash: string;
    invitedBy: string;
    expiresAt: Date;
  }): Promise<PlatformInvite> {
    const [invite] = await db.insert(platformInvites).values(values).returning();
    return invite;
  },

  /**
   * Delete a platform invite by id
   *
   * @param inviteId - Invite id
   */
  async deletePlatformInvite(inviteId: string): Promise<void> {
    await db.delete(platformInvites).where(eq(platformInvites.id, inviteId));
  },

  /**
   * Find a valid platform invite by token hash
   *
   * @param tokenHash - Hashed invite token
   * @returns Invite with inviter name, or null if missing/expired
   */
  async findValidPlatformInviteByTokenHash(
    tokenHash: string,
  ): Promise<PlatformInviteWithInviter | null> {
    const [row] = await db
      .select({ invite: platformInvites, inviterName: users.name })
      .from(platformInvites)
      .leftJoin(users, eq(users.id, platformInvites.invitedBy))
      .where(
        and(eq(platformInvites.tokenHash, tokenHash), gt(platformInvites.expiresAt, new Date())),
      );
    return row ?? null;
  },
};
