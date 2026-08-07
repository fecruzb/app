import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { HttpError } from "@/lib/errors";
import type { AppEnv } from "@/context";
import { syncPlatformAdminFromEnv } from "../platform-admin";
import { clearSessionCookie, getSessionUser, SESSION_COOKIE } from "../service";
import { bearerSessionToken } from "./bearer-session-token";

/**
 * Require authentication
 *
 * Cookie for browser same-origin; Bearer for Tauri shells (WKWebView drops
 * Secure cookies on HTTP). Sets `user` and `sessionToken` on the context.
 */
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE) ?? bearerSessionToken(c);
  if (!token) throw new HttpError(401, "Not authenticated");

  const sessionUser = await getSessionUser(token);
  if (!sessionUser) {
    clearSessionCookie(c);
    throw new HttpError(401, "Session expired");
  }

  const user = await syncPlatformAdminFromEnv(sessionUser);
  c.set("user", user);
  c.set("sessionToken", token);
  await next();
});
