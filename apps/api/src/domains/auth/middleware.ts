import { createMiddleware } from "hono/factory";
import { deleteCookie, getCookie } from "hono/cookie";
import { HttpError } from "../../lib/errors";
import type { AppEnv } from "../../lib/http";
import { getSessionUser, SESSION_COOKIE } from "./service";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) throw new HttpError(401, "Não autenticado");

  const user = await getSessionUser(token);
  if (!user) {
    deleteCookie(c, SESSION_COOKIE, { path: "/" });
    throw new HttpError(401, "Sessão expirada");
  }

  c.set("user", user);
  c.set("sessionToken", token);
  await next();
});
