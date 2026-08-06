import type { AppContext } from "@/context";
import { toAdminPlatformInviteDto } from "../dto";
import { adminRepository } from "../repository";

/**
 * List platform invites
 *
 * `GET /api/admin/invites`
 *
 * Returns pending (non-expired) platform signup invites.
 *
 * @param c - Platform admin request context
 * @returns 200 with an array of admin platform invite DTOs
 */
export async function listPlatformInvites(c: AppContext) {
  // -- Processing ------------------------------------------------------------
  const rows = await adminRepository.listPendingPlatformInvites();

  // -- Output ----------------------------------------------------------------
  return c.json(rows.map(toAdminPlatformInviteDto));
}
