import { createMiddleware } from "hono/factory";
import { deleteCookie, getCookie } from "hono/cookie";
import { HttpError } from "@/lib/errors";
import type { AppEnv } from "@/context";
import { getSessionUser, SESSION_COOKIE } from "./service";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) throw new HttpError(401, "Not authenticated");

  const user = await getSessionUser(token);
  if (!user) {
    deleteCookie(c, SESSION_COOKIE, { path: "/" });
    throw new HttpError(401, "Session expired");
  }

  c.set("user", user);
  c.set("sessionToken", token);
  await next();
});
