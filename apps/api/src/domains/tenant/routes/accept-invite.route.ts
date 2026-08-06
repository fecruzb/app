import { getCookie } from "hono/cookie";
import { acceptInviteNewAccountSchema } from "@app/shared";
import { hashPassword, hashToken } from "@/lib/crypto";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { authRepository } from "@/domains/auth/repository";
import {
  createSession,
  getSessionUser,
  SESSION_COOKIE,
  setSessionCookie,
} from "@/domains/auth/service";
import { tenantRepository } from "../repository";

/**
 * Accept an invite
 *
 * `POST /api/invites/:token/accept`
 *
 * Public handler: with an active session matching the invite email, joins the
 * tenant; without an account, creates one (email treated as verified) and
 * starts a session. Existing accounts must sign in first.
 *
 * @param c - Public request context (session cookie optional)
 * @returns 200/201 with `{ tenantSlug }` (and session cookie when registering)
 */
export async function acceptInvite(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const token = c.req.param("token") ?? "";
  const sessionToken = getCookie(c, SESSION_COOKIE);

  // -- Processing ------------------------------------------------------------
  const row = await tenantRepository.findValidInviteByTokenHash(hashToken(token));
  if (!row) throw new HttpError(404, "Invalid or expired invite");
  const { invite, tenant } = row;

  const sessionUser = sessionToken ? await getSessionUser(sessionToken) : null;
  let status: 200 | 201 = 200;
  let sessionToSet: string | null = null;

  if (sessionUser) {
    if (sessionUser.email !== invite.email) {
      throw new HttpError(
        403,
        `This invite is for ${invite.email} — sign out and sign in with that account`,
      );
    }
    const existing = await tenantRepository.findMember(tenant.id, sessionUser.id);
    if (!existing) {
      await tenantRepository.insertMember({
        tenantId: tenant.id,
        userId: sessionUser.id,
        role: invite.role,
      });
    }
    await tenantRepository.deleteInviteById(invite.id);
  } else {
    if (await authRepository.findUserByEmail(invite.email)) {
      throw new HttpError(401, "Sign in to accept the invite");
    }

    const data = await parseBody(c, acceptInviteNewAccountSchema);
    const user = await authRepository.insertUser({
      name: data.name,
      email: invite.email,
      passwordHash: hashPassword(data.password),
      emailVerifiedAt: new Date(),
    });
    await tenantRepository.insertMember({ tenantId: tenant.id, userId: user.id, role: invite.role });
    await tenantRepository.deleteInviteById(invite.id);

    sessionToSet = await createSession(user.id);
    status = 201;
  }

  // -- Output ----------------------------------------------------------------
  if (sessionToSet) setSessionCookie(c, sessionToSet);
  return c.json({ tenantSlug: tenant.slug }, status);
}
