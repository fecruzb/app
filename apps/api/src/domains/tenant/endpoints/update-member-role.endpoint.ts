import { updateMemberSchema } from "@app/shared";
import { HttpError, parseBody, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { tenantRepository } from "../repository";

export async function updateMemberRole(c: AppContext) {
  const data = await parseBody(c, updateMemberSchema);
  const tenant = c.get("tenant");
  const actor = c.get("membership");
  const targetUserId = uuidParam(c, "userId");

  const target = await tenantRepository.findMember(tenant.id, targetUserId);
  if (!target) throw new HttpError(404, "Member not found");

  // Only owners can change owner roles (promote or demote).
  if ((target.role === "owner" || data.role === "owner") && actor.role !== "owner") {
    throw new HttpError(403, "Only owners can change owner roles");
  }
  if (
    target.role === "owner" &&
    data.role !== "owner" &&
    (await tenantRepository.countOwners(tenant.id)) <= 1
  ) {
    throw new HttpError(400, "The tenant needs at least one owner");
  }

  await tenantRepository.updateMemberRole(tenant.id, targetUserId, data.role);
  return c.json({ ok: true });
}
