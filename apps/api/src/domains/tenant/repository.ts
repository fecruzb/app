/**
 * Tenant repository
 *
 * Owns every SQL touch of tenants, members and invites. Entity-prefixed
 * methods; queries are written inline. Returns rows / join shapes — map to
 * DTOs in `dto.ts`.
 */
import { and, asc, count, desc, eq, gt } from "drizzle-orm";
import { db } from "@/db/client";
import { users, type User } from "@/domains/auth/schema";
import {
  tenantInvites,
  tenantMembers,
  tenants,
  type Tenant,
  type TenantInvite,
  type TenantMember,
} from "./schema";

/** Membership row with the joined user. */
export type MemberWithUser = { member: TenantMember; user: User };

/** Tenant plus the user's role in it. */
export type TenantWithRole = { tenant: Tenant; role: TenantMember["role"] };

export const tenantRepository = {
  /**
   * Find a tenant by id
   *
   * @param tenantId - Tenant id
   * @returns The tenant row, or null
   */
  async findTenantById(tenantId: string): Promise<Tenant | null> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
    return tenant ?? null;
  },

  /**
   * Find a tenant by slug
   *
   * Returns null if no tenant matches.
   *
   * @param slug - Tenant slug
   * @returns The tenant row, or null
   */
  async findTenantBySlug(slug: string): Promise<Tenant | null> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug));
    return tenant ?? null;
  },

  /**
   * Count members
   *
   * @param tenantId - Tenant id
   * @returns Number of memberships
   */
  async countMembers(tenantId: string): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(tenantMembers)
      .where(eq(tenantMembers.tenantId, tenantId));
    return Number(row?.value ?? 0);
  },

  /**
   * Count pending invites
   *
   * Non-expired invites only.
   *
   * @param tenantId - Tenant id
   * @returns Number of pending invites
   */
  async countPendingInvites(tenantId: string): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(tenantInvites)
      .where(and(eq(tenantInvites.tenantId, tenantId), gt(tenantInvites.expiresAt, new Date())));
    return Number(row?.value ?? 0);
  },

  /**
   * Insert a tenant
   *
   * Returns the new row.
   *
   * @param values - New tenant fields
   * @param values.name - Display name
   * @param values.slug - Unique slug
   * @returns The inserted tenant row
   */
  async insertTenant(values: { name: string; slug: string }): Promise<Tenant> {
    const [tenant] = await db.insert(tenants).values(values).returning();
    return tenant;
  },

  /**
   * Update a tenant's name
   *
   * Returns the updated row.
   *
   * @param tenantId - Tenant id
   * @param name - New display name
   * @returns The updated tenant row
   */
  async updateTenantName(tenantId: string, name: string): Promise<Tenant> {
    const [tenant] = await db
      .update(tenants)
      .set({ name, updatedAt: new Date() })
      .where(eq(tenants.id, tenantId))
      .returning();
    return tenant;
  },

  /**
   * List a user's tenants
   *
   * Each row includes the tenant and the user's role.
   *
   * @param userId - User id
   * @returns Tenants with the user's role in each
   */
  async getUserTenants(userId: string): Promise<TenantWithRole[]> {
    return db
      .select({ tenant: tenants, role: tenantMembers.role })
      .from(tenantMembers)
      .innerJoin(tenants, eq(tenants.id, tenantMembers.tenantId))
      .where(eq(tenantMembers.userId, userId))
      .orderBy(asc(tenants.createdAt));
  },

  /**
   * Find a tenant with membership
   *
   * Single round-trip for middleware; null if the user is not a member.
   *
   * @param tenantId - Tenant id
   * @param userId - User id
   * @returns Tenant and membership, or null
   */
  async findTenantWithMembership(
    tenantId: string,
    userId: string,
  ): Promise<{ tenant: Tenant; membership: TenantMember } | null> {
    const [row] = await db
      .select({ tenant: tenants, membership: tenantMembers })
      .from(tenantMembers)
      .innerJoin(tenants, eq(tenants.id, tenantMembers.tenantId))
      .where(and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.userId, userId)));
    return row ?? null;
  },

  /**
   * List members
   *
   * Returns membership rows with joined user data.
   *
   * @param tenantId - Tenant id
   * @returns Members with user rows
   */
  async listMembers(tenantId: string): Promise<MemberWithUser[]> {
    return db
      .select({ member: tenantMembers, user: users })
      .from(tenantMembers)
      .innerJoin(users, eq(users.id, tenantMembers.userId))
      .where(eq(tenantMembers.tenantId, tenantId))
      .orderBy(tenantMembers.createdAt);
  },

  /**
   * Find a member
   *
   * By tenant and user id, or null.
   *
   * @param tenantId - Tenant id
   * @param userId - User id
   * @returns The membership row, or null
   */
  async findMember(tenantId: string, userId: string): Promise<TenantMember | null> {
    const [member] = await db
      .select()
      .from(tenantMembers)
      .where(and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.userId, userId)));
    return member ?? null;
  },

  /**
   * Find a member by email
   *
   * Looks up membership within the tenant via the users join.
   *
   * @param tenantId - Tenant id
   * @param email - User email
   * @returns The membership row, or null
   */
  async findMemberByEmail(tenantId: string, email: string): Promise<TenantMember | null> {
    const [row] = await db
      .select({ member: tenantMembers })
      .from(tenantMembers)
      .innerJoin(users, eq(users.id, tenantMembers.userId))
      .where(and(eq(tenantMembers.tenantId, tenantId), eq(users.email, email)));
    return row?.member ?? null;
  },

  /**
   * Count owners
   *
   * How many owners the tenant currently has.
   *
   * @param tenantId - Tenant id
   * @returns Number of owner memberships
   */
  async countOwners(tenantId: string): Promise<number> {
    const rows = await db
      .select()
      .from(tenantMembers)
      .where(and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.role, "owner")));
    return rows.length;
  },

  /**
   * Insert a member
   *
   * No row returned.
   *
   * @param values - New membership fields
   * @param values.tenantId - Tenant id
   * @param values.userId - User id
   * @param values.role - Membership role
   */
  async insertMember(values: {
    tenantId: string;
    userId: string;
    role: TenantMember["role"];
  }): Promise<void> {
    await db.insert(tenantMembers).values(values);
  },

  /**
   * Update a member's role
   *
   * Scoped to the tenant and user.
   *
   * @param tenantId - Tenant id
   * @param userId - User id
   * @param role - New membership role
   */
  async updateMemberRole(
    tenantId: string,
    userId: string,
    role: TenantMember["role"],
  ): Promise<void> {
    await db
      .update(tenantMembers)
      .set({ role })
      .where(and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.userId, userId)));
  },

  /**
   * Delete a member
   *
   * Removes the membership for the user in the tenant.
   *
   * @param tenantId - Tenant id
   * @param userId - User id
   */
  async deleteMember(tenantId: string, userId: string): Promise<void> {
    await db
      .delete(tenantMembers)
      .where(and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.userId, userId)));
  },

  /**
   * List pending invites
   *
   * Non-expired invites for the tenant, newest first.
   *
   * @param tenantId - Tenant id
   * @returns Pending invites with inviter name
   */
  async listPendingInvites(
    tenantId: string,
  ): Promise<{ invite: TenantInvite; inviterName: string | null }[]> {
    return db
      .select({ invite: tenantInvites, inviterName: users.name })
      .from(tenantInvites)
      .leftJoin(users, eq(users.id, tenantInvites.invitedBy))
      .where(and(eq(tenantInvites.tenantId, tenantId), gt(tenantInvites.expiresAt, new Date())))
      .orderBy(desc(tenantInvites.createdAt));
  },

  /**
   * Delete invites by email
   *
   * Clears pending invites so there is one active invite per email.
   *
   * @param tenantId - Tenant id
   * @param email - Invitee email
   */
  async deleteInvitesByEmail(tenantId: string, email: string): Promise<void> {
    await db
      .delete(tenantInvites)
      .where(and(eq(tenantInvites.tenantId, tenantId), eq(tenantInvites.email, email)));
  },

  /**
   * Insert an invite
   *
   * Returns the new row.
   *
   * @param values - New invite fields
   * @param values.tenantId - Tenant id
   * @param values.email - Invitee email
   * @param values.role - Role granted on accept
   * @param values.tokenHash - Hashed invite token
   * @param values.invitedBy - Inviter user id
   * @param values.expiresAt - Expiry timestamp
   * @returns The inserted invite row
   */
  async insertInvite(values: {
    tenantId: string;
    email: string;
    role: TenantInvite["role"];
    tokenHash: string;
    invitedBy: string;
    expiresAt: Date;
  }): Promise<TenantInvite> {
    const [invite] = await db.insert(tenantInvites).values(values).returning();
    return invite;
  },

  /**
   * Delete an invite
   *
   * Scoped to the tenant.
   *
   * @param tenantId - Tenant id
   * @param inviteId - Invite id
   */
  async deleteInvite(tenantId: string, inviteId: string): Promise<void> {
    await db
      .delete(tenantInvites)
      .where(and(eq(tenantInvites.tenantId, tenantId), eq(tenantInvites.id, inviteId)));
  },

  /**
   * Find a valid invite by token
   *
   * Non-expired invite with its tenant, or null.
   *
   * @param tokenHash - Hashed invite token
   * @returns Invite and tenant, or null
   */
  async findValidInviteByTokenHash(
    tokenHash: string,
  ): Promise<{ invite: TenantInvite; tenant: Tenant } | null> {
    const [row] = await db
      .select({ invite: tenantInvites, tenant: tenants })
      .from(tenantInvites)
      .innerJoin(tenants, eq(tenants.id, tenantInvites.tenantId))
      .where(and(eq(tenantInvites.tokenHash, tokenHash), gt(tenantInvites.expiresAt, new Date())));
    return row ?? null;
  },
};
