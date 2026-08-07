import { uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { removeTenantMember } from "../service";

/**
 * Remove a member
 *
 * `DELETE /api/tenants/:tenantId/members/:userId`
 *
 * Removes a member from the current tenant, or lets the caller leave. Owners
 * cannot leave their own tenant; the last owner cannot be removed. Revokes the
 * target's API keys for this tenant.
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

  // -- Processing ------------------------------------------------------------
  await removeTenantMember({
    tenantId: tenant.id,
    actor,
    actorUserId: user.id,
    targetUserId,
  });

  // -- Output ----------------------------------------------------------------
  return c.json({ ok: true });
}
