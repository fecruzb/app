import { getCookie } from "hono/cookie";
import type { AppContext } from "@/context";
import { clearSessionCookie, deleteSession, SESSION_COOKIE } from "../service";

/**
 * Log out
 *
 * `POST /api/auth/logout`
 *
 * Deletes the current session (if present) and clears the session cookie.
 *
 * @param c - Request context (session cookie optional)
 * @returns 200 with `{ ok: true }`
 */
export async function logout(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const token = getCookie(c, SESSION_COOKIE);

  // -- Processing ------------------------------------------------------------
  if (token) await deleteSession(token);

  // -- Output ----------------------------------------------------------------
  clearSessionCookie(c);
  return c.json({ ok: true });
}
