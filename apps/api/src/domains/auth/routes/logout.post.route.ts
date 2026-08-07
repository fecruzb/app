import { getCookie } from "hono/cookie";
import type { AppContext } from "@/context";
import { bearerSessionToken } from "../middleware";
import { SESSION_COOKIE } from "../constants";
import { clearSessionCookie, deleteSession } from "../service";

/**
 * Log out
 *
 * `POST /api/auth/logout`
 *
 * Deletes the current session (if present) and clears the session cookie.
 * Accepts the token from the cookie (browser) or the `Authorization: Bearer`
 * header (Tauri shells) so a shell logout revokes the DB session, not just the
 * local copy.
 *
 * @param c - Request context (session cookie or Bearer optional)
 * @returns 200 with `{ ok: true }`
 */
export async function logout(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const token = getCookie(c, SESSION_COOKIE) ?? bearerSessionToken(c);

  // -- Processing ------------------------------------------------------------
  if (token) await deleteSession(token);

  // -- Output ----------------------------------------------------------------
  clearSessionCookie(c);
  return c.json({ ok: true });
}
