import { updateTenantSchema } from "@app/shared";
import { parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toTenantSummary } from "../dto";
import { tenantRepository } from "../repository";

/**
 * Update tenant
 *
 * `PATCH /api/tenants/:tenantId`
 *
 * Renames the current tenant and returns the updated summary for the caller.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with the tenant summary DTO
 */
export async function updateTenant(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, updateTenantSchema);
  const tenantId = c.get("tenant").id;
  const role = c.get("membership").role;

  // -- Processing ------------------------------------------------------------
  const tenant = await tenantRepository.updateTenantName(tenantId, data.name);

  // -- Output ----------------------------------------------------------------
  return c.json(toTenantSummary(tenant, role));
}
