/**
 * Tenant service
 *
 * Business rules for tenants. There is no manual creation UI: every user gets
 * a personal tenant on signup and joins others by invite.
 */
import { tenantRepository } from "./repository";
import type { Tenant } from "./schema";

/**
 * Slugify a tenant name
 *
 * Normalizes accents, lowercases, and collapses non-alphanumerics to dashes.
 *
 * @param name - Display name to turn into a slug
 * @returns URL-safe slug (max 40 chars), or `"tenant"` if empty
 */
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

/**
 * Build a unique slug from a name
 *
 * Retries with a short random suffix when the base slug is taken.
 *
 * @param name - Display name to slugify
 * @returns A slug that does not yet exist
 */
async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  for (;;) {
    if (!(await tenantRepository.findBySlug(candidate))) return candidate;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
}

/**
 * Create a tenant with an owner
 *
 * Inserts the tenant and adds the user as owner in one flow.
 *
 * @param name - Tenant display name
 * @param userId - User who becomes the owner
 * @returns The created tenant row
 */
export async function createTenantWithOwner(name: string, userId: string): Promise<Tenant> {
  const slug = await uniqueSlug(name);
  const tenant = await tenantRepository.insertTenant({ name, slug });
  await tenantRepository.insertMember({ tenantId: tenant.id, userId, role: "owner" });
  return tenant;
}
