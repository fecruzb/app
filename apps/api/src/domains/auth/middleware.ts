import { createMiddleware } from "hono/factory";
import { deleteCookie, getCookie } from "hono/cookie";
import { HttpError } from "@/lib/errors";
import type { AppEnv } from "@/context";
import { isEffectivePlatformAdmin, syncPlatformAdminFromEnv } from "./platform-admin";
import { getSessionUser, SESSION_COOKIE } from "./service";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) throw new HttpError(401, "Not authenticated");

  const sessionUser = await getSessionUser(token);
  if (!sessionUser) {
    deleteCookie(c, SESSION_COOKIE, { path: "/" });
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
