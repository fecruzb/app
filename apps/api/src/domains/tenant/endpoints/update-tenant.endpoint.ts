import { updateTenantSchema } from "@app/shared";
import { parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { tenantRepository } from "../repository";
import { toTenantSummary } from "../service";

export async function updateTenant(c: AppContext) {
  const data = await parseBody(c, updateTenantSchema);
  const tenant = await tenantRepository.updateTenantName(c.get("tenant").id, data.name);
  return c.json(toTenantSummary(tenant, c.get("membership").role));
}
