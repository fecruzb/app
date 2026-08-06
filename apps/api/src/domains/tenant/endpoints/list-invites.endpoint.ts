import type { AppContext } from "@/context";
import { toInviteDto } from "../dto";
import { tenantRepository } from "../repository";

/**
 * List invites
 *
 * `GET /api/tenants/:tenantId/invites`
 *
 * Returns pending invites for the current tenant.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with an array of invite DTOs
 */
export async function listInvites(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const tenantId = c.get("tenant").id;

  // -- Processing ------------------------------------------------------------
  const rows = await tenantRepository.listPendingInvites(tenantId);

  // -- Output ----------------------------------------------------------------
  return c.json(rows.map((r) => toInviteDto(r.invite, r.inviterName)));
}
