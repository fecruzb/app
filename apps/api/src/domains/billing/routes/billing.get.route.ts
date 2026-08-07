import type { AppContext } from "@/context";
import { getTenantBilling } from "../service";

/**
 * Get tenant billing
 *
 * `GET /api/tenants/:tenantId/billing`
 *
 * Plan, seat usage, and AI spend for the current viewer and tenant.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with the tenant billing DTO
 */
export async function getBilling(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const tenant = c.get("tenant");
  const user = c.get("user");

  // -- Processing ------------------------------------------------------------
  const billing = await getTenantBilling(tenant.id, user.id);

  // -- Output ----------------------------------------------------------------
  return c.json(billing);
}
