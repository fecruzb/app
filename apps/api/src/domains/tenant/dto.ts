import type { InviteDto } from "@app/shared";
import type { TenantInvite } from "./schema";

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
