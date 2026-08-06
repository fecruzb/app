import { createApiKeySchema, type CreatedApiKeyDto } from "@app/shared";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toApiKeyDto } from "@/domains/auth/dto";
import { createApiKey } from "@/domains/auth/service";
import { tenantRepository } from "@/domains/tenant/repository";

export async function createApiKeyEndpoint(c: AppContext) {
  const { name, tenantId } = await parseBody(c, createApiKeySchema);
  const user = c.get("user");

  // The key can only be scoped to a tenant the user actually belongs to.
  const membership = await tenantRepository.findTenantWithMembership(tenantId, user.id);
  if (!membership) throw new HttpError(404, "Tenant not found");

  const { apiKey, key } = await createApiKey(user.id, tenantId, name);
  const dto: CreatedApiKeyDto = {
    ...toApiKeyDto({
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      tenantId: apiKey.tenantId,
      tenantName: membership.tenant.name,
      lastUsedAt: apiKey.lastUsedAt,
      createdAt: apiKey.createdAt,
    }),
    key,
  };
  return c.json(dto, 201);
}
