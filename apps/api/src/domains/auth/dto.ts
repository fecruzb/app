import type { ApiKeyDto, MeDto, UserDto } from "@app/shared";
import { tenantRepository } from "@/domains/tenant/repository";
import type { ApiKeyWithTenant } from "./repository";
import type { User } from "./schema";

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerifiedAt !== null,
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
  return { user: toUserDto(user), tenants: await tenantRepository.getUserTenants(user.id) };
}
