/**
 * Auth DTOs
 *
 * Maps auth repository shapes to shared user / API key / session DTOs.
 */
import type { ApiKeyDto, CreatedApiKeyDto, MeDto, UserDto } from "@app/shared";
import { toTenantSummary } from "@/domains/tenant/dto";
import { tenantRepository } from "@/domains/tenant/repository";
import { isEffectivePlatformAdmin, syncPlatformAdminFromEnv } from "./platform-admin";
import type { ApiKeyWithTenant } from "./repository";
import type { User } from "./schema";

/**
 * To user DTO
 *
 * @param user - User row
 * @returns Shared user DTO
 */
export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerifiedAt !== null,
    isPlatformAdmin: isEffectivePlatformAdmin(user),
    createdAt: user.createdAt.toISOString(),
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

/**
 * Build me payload
 *
 * Standard session response: user + tenants they belong to. Syncs the env-based
 * platform-admin flag before mapping.
 *
 * @param user - Authenticated user row
 * @returns Shared me DTO
 */
export async function buildMe(user: User): Promise<MeDto> {
  const synced = await syncPlatformAdminFromEnv(user);
  const rows = await tenantRepository.getUserTenants(synced.id);
  return {
    user: toUserDto(synced),
    tenants: rows.map((r) => toTenantSummary(r.tenant, r.role)),
  };
}
