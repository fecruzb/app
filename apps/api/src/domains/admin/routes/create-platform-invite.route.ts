import { createPlatformInviteSchema } from "@app/shared";
import { generateToken, hashToken } from "@/lib/crypto";
import { sendEmail } from "@/integrations/resend";
import { env } from "@/lib/env";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { authRepository } from "@/domains/auth/repository";
import { toAdminPlatformInviteDto } from "../dto";
import { platformInviteTemplate } from "../emails";
import { adminRepository } from "../repository";

/** Platform invite link lifetime (7 days). */
const PLATFORM_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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
  if (await authRepository.findUserByEmail(data.email)) {
    throw new HttpError(409, "An account with this email already exists");
  }

  await adminRepository.deletePlatformInvitesByEmail(data.email);

  const token = generateToken();
  const invite = await adminRepository.insertPlatformInvite({
    email: data.email,
    tokenHash: hashToken(token),
    invitedBy: user.id,
    expiresAt: new Date(Date.now() + PLATFORM_INVITE_TTL_MS),
  });

  const { subject, html } = platformInviteTemplate(user.name, `${env.appUrl}/join/${token}`);
  void sendEmail({ to: data.email, subject, html });

  // -- Output ----------------------------------------------------------------
  return c.json(toAdminPlatformInviteDto({ invite, inviterName: user.name }), 201);
}
