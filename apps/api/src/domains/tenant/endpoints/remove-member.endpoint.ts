import { HttpError, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { tenantRepository } from "../repository";

export async function removeMember(c: AppContext) {
  const tenant = c.get("tenant");
  const actor = c.get("membership");
  const targetUserId = uuidParam(c, "userId");
  const isSelf = targetUserId === c.get("user").id;

  if (!isSelf && actor.role !== "owner" && actor.role !== "admin") {
    throw new HttpError(403, "Apenas administradores podem remover membros");
  }

  const target = await tenantRepository.findMember(tenant.id, targetUserId);
  if (!target) throw new HttpError(404, "Membro não encontrado");

  if (isSelf && target.role === "owner") {
    throw new HttpError(400, "O owner não pode sair do próprio tenant");
  }
  if (!isSelf && target.role === "owner" && actor.role !== "owner") {
    throw new HttpError(403, "Apenas owners podem remover um owner");
  }
  if (target.role === "owner" && (await tenantRepository.countOwners(tenant.id)) <= 1) {
    throw new HttpError(400, "O tenant precisa de pelo menos um owner");
  }

  await tenantRepository.deleteMember(tenant.id, targetUserId);
  return c.json({ ok: true });
}
