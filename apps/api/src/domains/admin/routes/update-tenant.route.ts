import { updateAdminTenantSchema } from "@app/shared";
import { HttpError, parseBody, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { tenantRepository } from "@/domains/tenant/repository";
import { toAdminTenantDto } from "../dto";
import { adminRepository } from "../repository";

/**
 * Update a tenant
 *
 * `PATCH /api/admin/tenants/:tenantId`
 *
 * Updates name, slug, and/or plan from the platform admin area.
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

  if (data.slug && data.slug !== existing.slug) {
    const taken = await tenantRepository.findBySlug(data.slug);
    if (taken) throw new HttpError(409, "Slug already in use");
  }

  const patch: { name?: string; slug?: string; planId?: typeof data.planId } = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.slug !== undefined) patch.slug = data.slug;
  if (data.planId !== undefined) patch.planId = data.planId;

  const tenant = await adminRepository.updateTenant(tenantId, patch);
  if (!tenant) throw new HttpError(404, "Tenant not found");

  const rows = await adminRepository.listTenants();
  const row = rows.find((r) => r.tenant.id === tenantId);
  if (!row) throw new HttpError(404, "Tenant not found");

  // -- Output ----------------------------------------------------------------
  return c.json(toAdminTenantDto(row));
}
