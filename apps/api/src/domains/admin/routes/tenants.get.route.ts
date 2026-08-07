import type { AppContext } from "@/context";
import { toAdminTenantDto } from "../dto";
import { adminRepository } from "../repository";

/**
 * List tenants
 *
 * `GET /api/admin/tenants`
 *
 * Lists every tenant with member counts for the platform admin.
 *
 * @param c - Platform admin request context
 * @returns 200 with admin tenant DTOs
 */
export async function listTenants(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  // Platform admin middleware already ran.

  // -- Processing ------------------------------------------------------------
  const rows = await adminRepository.listTenants();

  // -- Output ----------------------------------------------------------------
  return c.json(rows.map(toAdminTenantDto));
}
