import { acceptPlatformInviteSchema } from "@app/shared";
import { hashToken } from "@/lib/crypto";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { buildMe } from "@/domains/auth/dto";
import { isEnvPlatformAdminEmail } from "@/domains/auth/platform-admin";
import { authRepository } from "@/domains/auth/repository";
import { createSession, hashPassword, setSessionCookie } from "@/domains/auth/service";
import { createTenantWithOwner } from "@/domains/tenant/service";
import { adminRepository } from "../repository";

/**
 * Accept a platform invite
 *
 * `POST /api/join/:token/accept`
 *
 * Creates an account (email treated as verified), a personal owner workspace,
 * consumes the invite, and starts a session. Bypasses SELF_SIGNUP_ENABLED.
 *
 * @param c - Public request context
 * @returns 201 with the me payload and session cookie set
 */
export async function acceptPlatformInvite(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const token = c.req.param("token") ?? "";
  const data = await parseBody(c, acceptPlatformInviteSchema);

  // -- Processing ------------------------------------------------------------
  const row = await adminRepository.findValidPlatformInviteByTokenHash(hashToken(token));
  if (!row) throw new HttpError(404, "Invalid or expired invite");

  if (await authRepository.findUserByEmail(row.invite.email)) {
    throw new HttpError(409, "An account with this email already exists — sign in instead");
  }

  const user = await authRepository.insertUser({
    name: data.name,
    email: row.invite.email,
    passwordHash: hashPassword(data.password),
    emailVerifiedAt: new Date(),
    isPlatformAdmin: isEnvPlatformAdminEmail(row.invite.email),
  });

  const firstName = data.name.split(" ")[0];
  await createTenantWithOwner(`${firstName}'s Workspace`, user.id);
  await adminRepository.deletePlatformInvite(row.invite.id);

  const sessionToken = await createSession(user.id);

  // -- Output ----------------------------------------------------------------
  setSessionCookie(c, sessionToken);
  return c.json(await buildMe(user), 201);
}
