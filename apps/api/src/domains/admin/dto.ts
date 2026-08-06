/**
 * Admin DTOs
 *
 * Maps admin repository shapes to shared admin DTOs.
 */
import type { AdminTenantDto, AdminUserDto } from "@app/shared";
import { isEffectivePlatformAdmin } from "@/domains/auth/platform-admin";
import type { TenantWithMemberCount, UserWithTenantCount } from "./repository";

export function toAdminUserDto(row: UserWithTenantCount): AdminUserDto {
  return {
    id: row.user.id,
    name: row.user.name,
    email: row.user.email,
    emailVerified: row.user.emailVerifiedAt !== null,
    isPlatformAdmin: isEffectivePlatformAdmin(row.user),
    tenantCount: Number(row.tenantCount),
    createdAt: row.user.createdAt.toISOString(),
  };
}

export function toAdminTenantDto(row: TenantWithMemberCount): AdminTenantDto {
  return {
    id: row.tenant.id,
    name: row.tenant.name,
    slug: row.tenant.slug,
    memberCount: row.memberCount,
    createdAt: row.tenant.createdAt.toISOString(),
  };
}
