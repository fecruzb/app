/**
 * Account DTOs
 *
 * Maps API key rows to shared account DTOs.
 */
import type { ApiKeyDto, CreatedApiKeyDto } from "@app/shared";
import type { ApiKeyWithTenant } from "@/domains/auth/repository";

/** API key row fields needed for DTO mapping (no secrets). */
type ApiKeyRow = {
  id: string;
  name: string;
  prefix: string;
  tenantId: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
};

/**
 * With tenant name
 *
 * Joins an inserted API key row with the tenant display name for DTO mapping.
 *
 * @param key - API key row (no `tokenHash`)
 * @param tenantName - Owning tenant's name
 * @returns Shape expected by `toApiKeyDto` / `toCreatedApiKeyDto`
 */
export function withApiKeyTenantName(key: ApiKeyRow, tenantName: string): ApiKeyWithTenant {
  return {
    id: key.id,
    name: key.name,
    prefix: key.prefix,
    tenantId: key.tenantId,
    tenantName,
    lastUsedAt: key.lastUsedAt,
    expiresAt: key.expiresAt,
    createdAt: key.createdAt,
  };
}

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
    expiresAt: key.expiresAt?.toISOString() ?? null,
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
