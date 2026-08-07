import { updateMemberSchema } from "@app/shared";
import { parseBody, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { updateTenantMemberRole } from "../service";

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
  await updateTenantMemberRole({
    tenantId: tenant.id,
    actorRole: actor.role,
    targetUserId,
    role: data.role,
  });

  // -- Output ----------------------------------------------------------------
  return c.json({ ok: true });
}
