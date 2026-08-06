/**
 * Tenant DTOs
 *
 * Maps tenant / member / invite repository shapes to shared DTOs.
 */
import type {
  InviteDto,
  MemberDto,
  PublicInviteDto,
  TenantRole,
  TenantSummaryDto,
} from "@app/shared";
import type { MemberWithUser } from "./repository";
import type { Tenant, TenantInvite } from "./schema";

/**
 * To tenant summary
 *
 * Compact tenant + role used in session payloads and switchers.
 *
 * @param tenant - Tenant row
 * @param role - Caller's role in the tenant
 * @returns Shared tenant summary DTO
 */
export function toTenantSummary(tenant: Tenant, role: TenantRole): TenantSummaryDto {
  return { id: tenant.id, name: tenant.name, slug: tenant.slug, role };
}

/**
 * To member DTO
 *
 * @param row - Membership joined with the user
 * @returns Shared member DTO
 */
export function toMemberDto({ member, user }: MemberWithUser): MemberDto {
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: member.role,
    joinedAt: member.createdAt.toISOString(),
  };
}

/**
 * To invite DTO
 *
 * @param invite - Tenant invite row
 * @param invitedByName - Inviter display name, if known
 * @returns Shared invite DTO
 */
export function toInviteDto(invite: TenantInvite, invitedByName: string | null): InviteDto {
  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    invitedByName,
    createdAt: invite.createdAt.toISOString(),
    expiresAt: invite.expiresAt.toISOString(),
  };
}

/**
 * To public invite DTO
 *
 * Accept-invite screen shape (no invite id / token).
 *
 * @param invite - Tenant invite row
 * @param tenant - Tenant the invite belongs to
 * @param userExists - Whether an account already exists for the invite email
 * @returns Shared public invite DTO
 */
export function toPublicInviteDto(
  invite: TenantInvite,
  tenant: Tenant,
  userExists: boolean,
): PublicInviteDto {
  return {
    tenantName: tenant.name,
    email: invite.email,
    role: invite.role,
    userExists,
  };
}
