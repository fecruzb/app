import type { AppContext } from "@/context";
import { toInviteDto } from "../dto";
import { tenantRepository } from "../repository";

export async function listInvites(c: AppContext) {
  const rows = await tenantRepository.listPendingInvites(c.get("tenant").id);
  return c.json(rows.map((r) => toInviteDto(r.invite, r.inviterName)));
}
