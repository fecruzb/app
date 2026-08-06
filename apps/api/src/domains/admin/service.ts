/**
 * Admin service
 *
 * Platform-invite create/accept flows (signup outside SELF_SIGNUP_ENABLED).
 */
import { generateToken, hashPassword, hashToken } from "@/lib/crypto";
import { sendEmail } from "@/integrations/resend";
import { env } from "@/lib/env";
import { HttpError } from "@/lib/errors";
import { isEnvPlatformAdminEmail } from "@/domains/auth/platform-admin";
import { authRepository } from "@/domains/auth/repository";
import { buildMe, createSession } from "@/domains/auth/service";
import type { MeDto } from "@app/shared";
import { createTenantWithOwner } from "@/domains/tenant/service";
import { platformInviteTemplate } from "./emails";
import { adminRepository } from "./repository";
import type { PlatformInvite } from "./schema";

/** Platform invite link lifetime (7 days). */
const PLATFORM_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Create a platform invite and email the join link
 */
export async function createPlatformInviteForEmail(args: {
  email: string;
  inviterId: string;
  inviterName: string;
}): Promise<{ invite: PlatformInvite; inviterName: string }> {
  const { email, inviterId, inviterName } = args;

  if (await authRepository.findUserByEmail(email)) {
    throw new HttpError(409, "An account with this email already exists");
  }

  await adminRepository.deletePlatformInvitesByEmail(email);

  const token = generateToken();
  const invite = await adminRepository.insertPlatformInvite({
    email,
    tokenHash: hashToken(token),
    invitedBy: inviterId,
    expiresAt: new Date(Date.now() + PLATFORM_INVITE_TTL_MS),
  });

  const { subject, html } = platformInviteTemplate(inviterName, `${env.appUrl}/join/${token}`);
  void sendEmail({ to: email, subject, html });

  return { invite, inviterName };
}

/**
 * Accept a platform invite: create user, personal workspace, session
 */
export async function acceptPlatformInviteForToken(args: {
  rawToken: string;
  name: string;
  password: string;
}): Promise<{ me: MeDto; sessionToken: string }> {
  const { rawToken, name, password } = args;

  const row = await adminRepository.findValidPlatformInviteByTokenHash(hashToken(rawToken));
  if (!row) throw new HttpError(404, "Invalid or expired invite");

  if (await authRepository.findUserByEmail(row.invite.email)) {
    throw new HttpError(409, "An account with this email already exists — sign in instead");
  }

  const user = await authRepository.insertUser({
    name,
    email: row.invite.email,
    passwordHash: hashPassword(password),
    emailVerifiedAt: new Date(),
    isPlatformAdmin: isEnvPlatformAdminEmail(row.invite.email),
  });

  const firstName = name.split(" ")[0];
  await createTenantWithOwner(`${firstName}'s Workspace`, user.id);
  await adminRepository.deletePlatformInvite(row.invite.id);

  const sessionToken = await createSession(user.id);
  return { me: await buildMe(user), sessionToken };
}
