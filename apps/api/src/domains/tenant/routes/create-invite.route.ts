import { createInviteSchema } from "@app/shared";
import { generateToken, hashToken } from "@/lib/crypto";
import { sendEmail } from "@/integrations/resend";
import { env } from "@/lib/env";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toInviteDto } from "../dto";
import { inviteTemplate } from "../emails";
import { tenantRepository } from "../repository";

/** Invite link lifetime (7 days). */
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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
  if (await tenantRepository.findMemberByEmail(tenant.id, data.email)) {
    throw new HttpError(409, "This person is already a member of the tenant");
  }

  await tenantRepository.deleteInvitesByEmail(tenant.id, data.email);

  const token = generateToken();
  const invite = await tenantRepository.insertInvite({
    tenantId: tenant.id,
    email: data.email,
    role: data.role,
    tokenHash: hashToken(token),
    invitedBy: user.id,
    expiresAt: new Date(Date.now() + INVITE_TTL_MS),
  });

  const { subject, html } = inviteTemplate(tenant.name, user.name, `${env.appUrl}/invite/${token}`);
  void sendEmail({ to: data.email, subject, html });

  // -- Output ----------------------------------------------------------------
  return c.json(toInviteDto(invite, user.name), 201);
}
