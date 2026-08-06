import { createPlatformInviteSchema } from "@app/shared";
import { parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toAdminPlatformInviteDto } from "../dto";
import { createPlatformInviteForEmail } from "../service";

/**
 * Create a platform invite
 *
 * `POST /api/admin/invites`
 *
 * Creates (or replaces) a pending signup invite for an email, emails the link,
 * and returns the invite DTO. Rejected if the email already has an account.
 *
 * @param c - Platform admin request context
 * @returns 201 with the admin platform invite DTO
 */
export async function createPlatformInvite(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, createPlatformInviteSchema);
  const user = c.get("user");

  // -- Processing ------------------------------------------------------------
  const { invite, inviterName } = await createPlatformInviteForEmail({
    email: data.email,
    inviterId: user.id,
    inviterName: user.name,
  });

  // -- Output ----------------------------------------------------------------
  return c.json(toAdminPlatformInviteDto({ invite, inviterName }), 201);
}
