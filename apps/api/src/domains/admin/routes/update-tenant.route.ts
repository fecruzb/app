import { updateAdminTenantSchema } from "@app/shared";
import { HttpError, parseBody, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toAdminTenantDto } from "../dto";
import { adminRepository } from "../repository";

/**
 * Update a tenant
 *
 * `PATCH /api/admin/tenants/:tenantId`
 *
 * Renames a tenant from the platform admin area.
 *
 * @param c - Platform admin request context
 * @returns 200 with the updated admin tenant DTO
 */
export async function updateTenant(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, updateAdminTenantSchema);
  const tenantId = uuidParam(c, "tenantId");

  // -- Processing ------------------------------------------------------------
  const existing = await adminRepository.findTenant(tenantId);
  if (!existing) throw new HttpError(404, "Tenant not found");

  const tenant = await adminRepository.renameTenant(tenantId, data.name);
  if (!tenant) throw new HttpError(404, "Tenant not found");

  const rows = await adminRepository.listTenants();
  const row = rows.find((r) => r.tenant.id === tenantId);
  if (!row) throw new HttpError(404, "Tenant not found");

  // -- Output ----------------------------------------------------------------
  return c.json(toAdminTenantDto(row));
}
