// All tenant data access (tenants, members, invites) goes through here.
import { and, asc, desc, eq, gt } from "drizzle-orm";
import type { MemberDto, TenantSummaryDto } from "@app/shared";
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

export const tenantRepository = {
  // -- tenants ---------------------------------------------------------------

  async findBySlug(slug: string): Promise<Tenant | null> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug));
    return tenant ?? null;
  },

  /** Tenant mais antigo do banco (fallback do MCP stdio). */
  async findOldest(): Promise<Tenant | null> {
    const [tenant] = await db.select().from(tenants).orderBy(asc(tenants.createdAt)).limit(1);
    return tenant ?? null;
  },

  async insertTenant(values: { name: string; slug: string }): Promise<Tenant> {
    const [tenant] = await db.insert(tenants).values(values).returning();
    return tenant;
  },

  async updateTenantName(tenantId: string, name: string): Promise<Tenant> {
    const [tenant] = await db
      .update(tenants)
      .set({ name, updatedAt: new Date() })
      .where(eq(tenants.id, tenantId))
      .returning();
    return tenant;
  },

  // -- members -----------------------------------------------------------------

  async getUserTenants(userId: string): Promise<TenantSummaryDto[]> {
    const rows = await db
      .select({ tenant: tenants, role: tenantMembers.role })
      .from(tenantMembers)
      .innerJoin(tenants, eq(tenants.id, tenantMembers.tenantId))
      .where(eq(tenantMembers.userId, userId))
      .orderBy(asc(tenants.createdAt));
    return rows.map((r) => ({
      id: r.tenant.id,
      name: r.tenant.name,
      slug: r.tenant.slug,
      role: r.role,
    }));
  },

  /** Tenant + user membership in a single round-trip (used by the middleware). */
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

  async listMembers(tenantId: string): Promise<MemberDto[]> {
    const rows = await db
      .select({ member: tenantMembers, user: users })
      .from(tenantMembers)
      .innerJoin(users, eq(users.id, tenantMembers.userId))
      .where(eq(tenantMembers.tenantId, tenantId))
      .orderBy(tenantMembers.createdAt);
    return rows.map((r) => ({
      userId: r.user.id,
      name: r.user.name,
      email: r.user.email,
      role: r.member.role,
      joinedAt: r.member.createdAt.toISOString(),
    }));
  },

  async findMember(tenantId: string, userId: string): Promise<TenantMember | null> {
    const [member] = await db
      .select()
      .from(tenantMembers)
      .where(and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.userId, userId)));
    return member ?? null;
  },

  async findMemberByEmail(tenantId: string, email: string): Promise<TenantMember | null> {
    const [row] = await db
      .select({ member: tenantMembers })
      .from(tenantMembers)
      .innerJoin(users, eq(users.id, tenantMembers.userId))
      .where(and(eq(tenantMembers.tenantId, tenantId), eq(users.email, email)));
    return row?.member ?? null;
  },

  /** Primeiro owner do tenant (autor das escritas no MCP stdio). */
  async findFirstOwner(tenantId: string): Promise<User | null> {
    const [row] = await db
      .select({ user: users })
      .from(tenantMembers)
      .innerJoin(users, eq(users.id, tenantMembers.userId))
      .where(and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.role, "owner")))
      .orderBy(asc(tenantMembers.createdAt))
      .limit(1);
    return row?.user ?? null;
  },

  async countOwners(tenantId: string): Promise<number> {
    const rows = await db
      .select()
      .from(tenantMembers)
      .where(and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.role, "owner")));
    return rows.length;
  },

  async insertMember(values: { tenantId: string; userId: string; role: TenantMember["role"] }) {
    await db.insert(tenantMembers).values(values);
  },

  async updateMemberRole(tenantId: string, userId: string, role: TenantMember["role"]) {
    await db
      .update(tenantMembers)
      .set({ role })
      .where(and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.userId, userId)));
  },

  async deleteMember(tenantId: string, userId: string) {
    await db
      .delete(tenantMembers)
      .where(and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.userId, userId)));
  },

  // -- invites -----------------------------------------------------------------

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

  /** Remove pending invites for the email (one active invite per email). */
  async deleteInvitesByEmail(tenantId: string, email: string) {
    await db
      .delete(tenantInvites)
      .where(and(eq(tenantInvites.tenantId, tenantId), eq(tenantInvites.email, email)));
  },

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

  async deleteInvite(tenantId: string, inviteId: string) {
    await db
      .delete(tenantInvites)
      .where(and(eq(tenantInvites.tenantId, tenantId), eq(tenantInvites.id, inviteId)));
  },

  async deleteInviteById(inviteId: string) {
    await db.delete(tenantInvites).where(eq(tenantInvites.id, inviteId));
  },

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
