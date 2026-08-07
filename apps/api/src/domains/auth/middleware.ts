import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { HttpError } from "@/lib/errors";
import type { AppEnv } from "@/context";
import { isEffectivePlatformAdmin, syncPlatformAdminFromEnv } from "./platform-admin";
import { clearSessionCookie, getSessionUser, SESSION_COOKIE } from "./service";

/** Extracts a session token from an `Authorization: Bearer` header (Tauri shells), if present. */
export function bearerSessionToken(c: {
  req: { header: (name: string) => string | undefined };
}): string | null {
  const header = c.req.header("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  // Personal API keys use the `abk_` prefix — those authenticate MCP, not cookie routes.
  if (!token || token.startsWith("abk_")) return null;
  return token;
}

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  // Cookie for browser same-origin; Bearer for Tauri shells (WKWebView drops Secure cookies on HTTP).
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

/** Requires an authenticated platform admin (app owner). Use after `requireAuth`. */
export const requirePlatformAdmin = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get("user");
  if (!isEffectivePlatformAdmin(user)) throw new HttpError(403, "Platform admin required");
  await next();
});
