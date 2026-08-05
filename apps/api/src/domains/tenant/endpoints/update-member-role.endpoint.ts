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
  if (!target) throw new HttpError(404, "Membro não encontrado");

  // Só owners mexem em roles de owner (promover ou rebaixar)
  if ((target.role === "owner" || data.role === "owner") && actor.role !== "owner") {
    throw new HttpError(403, "Apenas owners podem alterar roles de owner");
  }
  if (
    target.role === "owner" &&
    data.role !== "owner" &&
    (await tenantRepository.countOwners(tenant.id)) <= 1
  ) {
    throw new HttpError(400, "O tenant precisa de pelo menos um owner");
  }

  await tenantRepository.updateMemberRole(tenant.id, targetUserId, data.role);
  return c.json({ ok: true });
}
