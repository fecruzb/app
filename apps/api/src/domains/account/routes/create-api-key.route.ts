import { createApiKeySchema, type CreatedApiKeyDto } from "@app/shared";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toApiKeyDto } from "@/domains/auth/dto";
import { createApiKey as createApiKeyForUser } from "@/domains/auth/service";
import { tenantRepository } from "@/domains/tenant/repository";

/**
 * Create an API key
 *
 * `POST /api/account/api-keys`
 *
 * Issues a new API key scoped to a tenant the authenticated user belongs to.
 * The raw key is returned once in the response.
 *
 * @param c - Authenticated request context
 * @returns 201 with the created API key DTO including the raw `key`
 */
export async function createApiKey(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const { name, tenantId } = await parseBody(c, createApiKeySchema);
  const user = c.get("user");

  // -- Processing ------------------------------------------------------------
  const membership = await tenantRepository.findTenantWithMembership(tenantId, user.id);
  if (!membership) throw new HttpError(404, "Tenant not found");

  const { apiKey, key } = await createApiKeyForUser(user.id, tenantId, name);

  // -- Output ----------------------------------------------------------------
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
