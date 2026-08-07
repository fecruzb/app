import { createInviteSchema } from "@app/shared";
import { parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toInviteDto } from "../dto";
import { createTenantInvite } from "../service";

/**
 * Create an invite
 *
 * `POST /api/tenants/:tenantId/invites`
 *
 * Creates (or replaces) a pending invite for an email, emails the invite link,
 * and returns the invite DTO. Rejected if the email is already a member.
 *
 * @param c - Authenticated tenant request context
 * @returns 201 with the invite DTO
 */
export async function createInvite(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, createInviteSchema);
  const tenant = c.get("tenant");
  const user = c.get("user");

  // -- Processing ------------------------------------------------------------
  const { invite, inviterName } = await createTenantInvite({
    tenantId: tenant.id,
    tenantName: tenant.name,
    inviterId: user.id,
    inviterName: user.name,
    email: data.email,
    role: data.role,
  });

  // -- Output ----------------------------------------------------------------
  return c.json(toInviteDto(invite, inviterName), 201);
}
