/**
 * Admin DTOs
 *
 * Maps admin repository shapes to shared admin DTOs.
 */
import type { AdminPlatformInviteDto, AdminTenantDto, AdminUserDto } from "@app/shared";
import { isEffectivePlatformAdmin } from "@/domains/auth/platform-admin";
import type {
  PlatformInviteWithInviter,
  TenantWithMemberCount,
  UserWithTenantCount,
} from "./repository";

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
    planId: row.tenant.planId,
    memberCount: row.memberCount,
    members: row.members.map((member) => ({
      userId: member.userId,
      name: member.name,
      email: member.email,
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
    })),
    createdAt: row.tenant.createdAt.toISOString(),
  };
}

export function toAdminPlatformInviteDto(row: PlatformInviteWithInviter): AdminPlatformInviteDto {
  return {
    id: row.invite.id,
    email: row.invite.email,
    invitedByName: row.inviterName,
    createdAt: row.invite.createdAt.toISOString(),
    expiresAt: row.invite.expiresAt.toISOString(),
  };
}
