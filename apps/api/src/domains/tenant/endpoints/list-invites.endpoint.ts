import type { InviteDto } from "@app/shared";
import type { AppContext } from "../../../lib/http";
import { tenantRepository } from "../repository";

export async function listInvites(c: AppContext) {
  const rows = await tenantRepository.listPendingInvites(c.get("tenant").id);
  const dtos: InviteDto[] = rows.map((r) => ({
    id: r.invite.id,
    email: r.invite.email,
    role: r.invite.role,
    invitedByName: r.inviterName,
    createdAt: r.invite.createdAt.toISOString(),
    expiresAt: r.invite.expiresAt.toISOString(),
  }));
  return c.json(dtos);
}
