import type { InviteDto, MemberDto, TenantRole, TenantSummaryDto } from "@app/shared";
import type { MemberWithUser } from "./repository";
import type { Tenant, TenantInvite } from "./schema";

export function toTenantSummary(tenant: Tenant, role: TenantRole): TenantSummaryDto {
  return { id: tenant.id, name: tenant.name, slug: tenant.slug, role };
}

export function toMemberDto({ member, user }: MemberWithUser): MemberDto {
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: member.role,
    joinedAt: member.createdAt.toISOString(),
  };
}

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
