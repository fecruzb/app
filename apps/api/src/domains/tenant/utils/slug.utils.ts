/**
 * Tenant slug helpers
 *
 * URL-safe slug generation and uniqueness against existing tenants.
 */
import { tenantRepository } from "../repository";

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
export async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  for (;;) {
    if (!(await tenantRepository.findTenantBySlug(candidate))) return candidate;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
}
