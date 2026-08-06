/**
 * Admin repository
 *
 * Cross-tenant SQL for the platform admin area. Only called from admin routes
 * gated by `requirePlatformAdmin`. Returns rows / join shapes — map in `dto.ts`.
 */
import { asc, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { users, type User } from "@/domains/auth/schema";
import { tenantMembers, tenants, type Tenant } from "@/domains/tenant/schema";

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
   * Rename a tenant
   *
   * @param tenantId - Tenant id
   * @param name - New display name
   * @returns The updated tenant row, or null if missing
   */
  async renameTenant(tenantId: string, name: string): Promise<Tenant | null> {
    const [tenant] = await db
      .update(tenants)
      .set({ name, updatedAt: new Date() })
      .where(eq(tenants.id, tenantId))
      .returning();
    return tenant ?? null;
  },
};
