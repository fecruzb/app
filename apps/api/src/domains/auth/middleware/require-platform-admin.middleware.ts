import { createMiddleware } from "hono/factory";
import { HttpError } from "@/lib/errors";
import type { AppEnv } from "@/context";
import { isEffectivePlatformAdmin } from "../platform-admin";

/**
 * Require platform admin
 *
 * App-owner gate. Use after `requireAuth`.
 */
export const requirePlatformAdmin = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get("user");
  if (!isEffectivePlatformAdmin(user)) throw new HttpError(403, "Platform admin required");
  await next();
});
