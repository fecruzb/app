import { updateMemberSchema } from "@app/shared";
import { HttpError, parseBody, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { tenantRepository } from "../repository";

/**
 * Update member role
 *
 * `PATCH /api/tenants/:tenantId/members/:userId`
 *
 * Changes a member's role in the current tenant. Only owners may promote or
 * demote owners, and the last owner cannot be demoted.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with `{ ok: true }`
 */
export async function updateMemberRole(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, updateMemberSchema);
  const tenant = c.get("tenant");
  const actor = c.get("membership");
  const targetUserId = uuidParam(c, "userId");

  // -- Processing ------------------------------------------------------------
  const target = await tenantRepository.findMember(tenant.id, targetUserId);
  if (!target) throw new HttpError(404, "Member not found");

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

  // -- Output ----------------------------------------------------------------
  return c.json({ ok: true });
}
