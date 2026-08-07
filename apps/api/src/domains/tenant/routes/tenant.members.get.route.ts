import type { AppContext } from "@/context";
import { toMemberDto } from "../dto";
import { tenantRepository } from "../repository";

/**
 * List members
 *
 * `GET /api/tenants/:tenantId/members`
 *
 * Returns all members of the current tenant.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with an array of member DTOs
 */
export async function listMembers(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const tenantId = c.get("tenant").id;

  // -- Processing ------------------------------------------------------------
  const rows = await tenantRepository.listMembers(tenantId);

  // -- Output ----------------------------------------------------------------
  return c.json(rows.map(toMemberDto));
}
