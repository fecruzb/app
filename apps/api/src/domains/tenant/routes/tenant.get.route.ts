import type { AppContext } from "@/context";
import { toTenantSummary } from "../dto";

/**
 * Get tenant
 *
 * `GET /api/tenants/:tenantId`
 *
 * Returns a summary of the current tenant and the caller's role.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with the tenant summary DTO
 */
export async function getTenant(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const tenant = c.get("tenant");
  const role = c.get("membership").role;

  // -- Processing ------------------------------------------------------------

  // -- Output ----------------------------------------------------------------
  return c.json(toTenantSummary(tenant, role));
}
