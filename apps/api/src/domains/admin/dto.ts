/**
 * Admin DTOs
 *
 * Maps admin repository shapes to shared admin DTOs.
 */
import type {
  AdminPlatformInviteDto,
  AdminTenantDto,
  AdminUserDto,
  PublicPlatformInviteDto,
} from "@app/shared";
import { isEffectivePlatformAdmin } from "@/domains/auth/utils";
import type {
  PlatformInviteWithInviter,
  TenantWithMemberCount,
  UserWithTenantCount,
} from "./repository";
import type { PlatformInvite } from "./schema";

/**
 * To admin user DTO
 *
 * @param row - User with tenant membership count
 * @returns Shared admin user DTO
 */
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

/**
 * To admin tenant DTO
 *
 * @param row - Tenant with member count and member list
 * @returns Shared admin tenant DTO
 */
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

/**
 * To admin platform invite DTO
 *
 * @param row - Platform invite with inviter name
 * @returns Shared admin platform invite DTO
 */
export function toAdminPlatformInviteDto(row: PlatformInviteWithInviter): AdminPlatformInviteDto {
  return {
    id: row.invite.id,
    email: row.invite.email,
    invitedByName: row.inviterName,
    createdAt: row.invite.createdAt.toISOString(),
    expiresAt: row.invite.expiresAt.toISOString(),
  };
}

/**
 * To public platform invite DTO
 *
 * Join screen shape (no invite id / token).
 *
 * @param invite - Platform invite row
 * @param inviterName - Inviter display name, if known
 * @param userExists - Whether an account already exists for the invite email
 * @returns Shared public platform invite DTO
 */
export function toPublicPlatformInviteDto(
  invite: PlatformInvite,
  inviterName: string | null,
  userExists: boolean,
): PublicPlatformInviteDto {
  return {
    email: invite.email,
    inviterName,
    userExists,
  };
}
