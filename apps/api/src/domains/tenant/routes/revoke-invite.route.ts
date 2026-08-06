import { uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { tenantRepository } from "../repository";

/**
 * Revoke an invite
 *
 * `DELETE /api/tenants/:tenantId/invites/:inviteId`
 *
 * Deletes a pending invite by id within the current tenant.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with `{ ok: true }`
 */
export async function revokeInvite(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const tenantId = c.get("tenant").id;
  const inviteId = uuidParam(c, "inviteId");

  // -- Processing ------------------------------------------------------------
  await tenantRepository.deleteInvite(tenantId, inviteId);

  // -- Output ----------------------------------------------------------------
  return c.json({ ok: true });
}
