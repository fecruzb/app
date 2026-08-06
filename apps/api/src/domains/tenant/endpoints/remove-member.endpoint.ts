import { HttpError, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { tenantRepository } from "../repository";

/**
 * Remove a member
 *
 * `DELETE /api/tenants/:tenantId/members/:userId`
 *
 * Removes a member from the current tenant, or lets the caller leave. Owners
 * cannot leave their own tenant; the last owner cannot be removed.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with `{ ok: true }`
 */
export async function removeMember(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const tenant = c.get("tenant");
  const actor = c.get("membership");
  const user = c.get("user");
  const targetUserId = uuidParam(c, "userId");
  const isSelf = targetUserId === user.id;

  // -- Processing ------------------------------------------------------------
  if (!isSelf && actor.role !== "owner" && actor.role !== "admin") {
    throw new HttpError(403, "Only administrators can remove members");
  }

  const target = await tenantRepository.findMember(tenant.id, targetUserId);
  if (!target) throw new HttpError(404, "Member not found");

  if (isSelf && target.role === "owner") {
    throw new HttpError(400, "The owner can't leave their own tenant");
  }
  if (!isSelf && target.role === "owner" && actor.role !== "owner") {
    throw new HttpError(403, "Only owners can remove an owner");
  }
  if (target.role === "owner" && (await tenantRepository.countOwners(tenant.id)) <= 1) {
    throw new HttpError(400, "The tenant needs at least one owner");
  }

  await tenantRepository.deleteMember(tenant.id, targetUserId);

  // -- Output ----------------------------------------------------------------
  return c.json({ ok: true });
}
