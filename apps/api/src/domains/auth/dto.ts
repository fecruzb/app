import type { ApiKeyDto, MeDto, UserDto } from "@app/shared";
import { toTenantSummary } from "@/domains/tenant/dto";
import { tenantRepository } from "@/domains/tenant/repository";
import { isEffectivePlatformAdmin, syncPlatformAdminFromEnv } from "./platform-admin";
import type { ApiKeyWithTenant } from "./repository";
import type { User } from "./schema";

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

/** Standard session response: user + tenants they belong to. */
export async function buildMe(user: User): Promise<MeDto> {
  const synced = await syncPlatformAdminFromEnv(user);
  const rows = await tenantRepository.getUserTenants(synced.id);
  return {
    user: toUserDto(synced),
    tenants: rows.map((r) => toTenantSummary(r.tenant, r.role)),
  };
}
