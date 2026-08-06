import { uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { adminRepository } from "../repository";

/**
 * Revoke a platform invite
 *
 * `DELETE /api/admin/invites/:inviteId`
 *
 * Deletes a pending platform signup invite by id.
 *
 * @param c - Platform admin request context
 * @returns 200 with `{ ok: true }`
 */
export async function revokePlatformInvite(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const inviteId = uuidParam(c, "inviteId");

  // -- Processing ------------------------------------------------------------
  await adminRepository.deletePlatformInvite(inviteId);

  // -- Output ----------------------------------------------------------------
  return c.json({ ok: true });
}
