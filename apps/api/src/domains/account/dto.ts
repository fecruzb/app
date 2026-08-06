/**
 * Account DTOs
 *
 * Maps API key rows to shared account DTOs.
 */
import type { ApiKeyDto, CreatedApiKeyDto } from "@app/shared";
import type { ApiKeyWithTenant } from "@/domains/auth/repository";

/**
 * To API key DTO
 *
 * Metadata only — never includes the raw key.
 *
 * @param key - API key row with tenant name
 * @returns Shared API key DTO
 */
export function toApiKeyDto(key: ApiKeyWithTenant): ApiKeyDto {
  return {
    id: key.id,
    name: key.name,
    prefix: key.prefix,
    tenantId: key.tenantId,
    tenantName: key.tenantName,
    lastUsedAt: key.lastUsedAt?.toISOString() ?? null,
    createdAt: key.createdAt.toISOString(),
  };
}

/**
 * To created API key DTO
 *
 * Creation response — includes the raw key (shown once).
 *
 * @param key - API key row with tenant name
 * @param rawKey - Raw key value returned only at creation
 * @returns Shared created API key DTO
 */
export function toCreatedApiKeyDto(key: ApiKeyWithTenant, rawKey: string): CreatedApiKeyDto {
  return { ...toApiKeyDto(key), key: rawKey };
}
