import { createMiddleware } from "hono/factory";
import { managerRoles } from "@app/shared";
import { HttpError } from "@/lib/errors";
import type { AppEnv } from "@/context";

/**
 * Require manager role
 *
 * Owner or admin only. Requires `requireTenant` before.
 */
export const requireManager = createMiddleware<AppEnv>(async (c, next) => {
  const membership = c.get("membership");
  if (!managerRoles.includes(membership.role)) {
    throw new HttpError(403, "Only administrators can do this");
  }
  await next();
});
