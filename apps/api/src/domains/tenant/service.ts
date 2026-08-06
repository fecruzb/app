// Tenant business rules. There is no manual creation: every user gets a
// personal tenant on signup and joins others by invite.
import { tenantRepository } from "./repository";
import type { Tenant } from "./schema";

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
    if (!(await tenantRepository.findBySlug(candidate))) return candidate;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
}

export async function createTenantWithOwner(name: string, userId: string): Promise<Tenant> {
  const slug = await uniqueSlug(name);
  const tenant = await tenantRepository.insertTenant({ name, slug });
  await tenantRepository.insertMember({ tenantId: tenant.id, userId, role: "owner" });
  return tenant;
}
