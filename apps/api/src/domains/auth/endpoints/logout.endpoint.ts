import { deleteCookie, getCookie } from "hono/cookie";
import type { AppContext } from "@/lib/http";
import { deleteSession, SESSION_COOKIE } from "../service";

export async function logout(c: AppContext) {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await deleteSession(token);
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ ok: true });
}
