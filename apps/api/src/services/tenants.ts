import { asc, eq } from "drizzle-orm";
import type { MeDto, TenantSummaryDto, UserDto } from "@app/shared";
import { db } from "../db/client";
import { tenantMembers, tenants, type Tenant, type User } from "../db/schema";

export function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "tenant"
  );
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  for (;;) {
    const [existing] = await db.select().from(tenants).where(eq(tenants.slug, candidate));
    if (!existing) return candidate;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
}

export async function createTenantWithOwner(name: string, userId: string): Promise<Tenant> {
  const slug = await uniqueSlug(name);
  const [tenant] = await db.insert(tenants).values({ name, slug }).returning();
  await db.insert(tenantMembers).values({ tenantId: tenant.id, userId, role: "owner" });
  return tenant;
}

export async function getUserTenants(userId: string): Promise<TenantSummaryDto[]> {
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
}

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerifiedAt !== null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function buildMe(user: User): Promise<MeDto> {
  return { user: toUserDto(user), tenants: await getUserTenants(user.id) };
}
