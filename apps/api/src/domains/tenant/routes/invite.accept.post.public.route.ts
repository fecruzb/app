import { getCookie } from "hono/cookie";
import { acceptInviteNewAccountSchema } from "@app/shared";
import { parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { getSessionUser, SESSION_COOKIE, setSessionCookie } from "@/domains/auth/service";
import { acceptTenantInvite } from "../service";

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
  const sessionUser = sessionToken ? await getSessionUser(sessionToken) : null;

  // -- Processing ------------------------------------------------------------
  const result = await acceptTenantInvite({
    rawToken: token,
    sessionUserId: sessionUser?.id ?? null,
    sessionUserEmail: sessionUser?.email ?? null,
    loadNewAccount: sessionUser
      ? undefined
      : () => parseBody(c, acceptInviteNewAccountSchema),
  });

  // -- Output ----------------------------------------------------------------
  if (result.sessionToken) setSessionCookie(c, result.sessionToken);
  return c.json({ tenantSlug: result.tenantSlug }, result.status);
}
