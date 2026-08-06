import { acceptPlatformInviteSchema } from "@app/shared";
import { parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { setSessionCookie } from "@/domains/auth/service";
import { acceptPlatformInviteForToken } from "../service";

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
  const { me, sessionToken } = await acceptPlatformInviteForToken({
    rawToken: token,
    name: data.name,
    password: data.password,
  });

  // -- Output ----------------------------------------------------------------
  setSessionCookie(c, sessionToken);
  return c.json(me, 201);
}
