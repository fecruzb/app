import { createMiddleware } from "hono/factory";
import { managerRoles } from "@app/shared";
import { HttpError } from "@/lib/errors";
import type { AppEnv } from "@/context";
import { tenantRepository } from "./repository";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves the `:tenantId` param and checks the user is a member. Data
 * isolation starts here: handlers use `c.get("tenant").id`, never a tenant id
 * from the body. Requires `requireAuth` before.
 */
export const requireTenant = createMiddleware<AppEnv>(async (c, next) => {
  const tenantId = c.req.param("tenantId");
  if (!tenantId || !UUID_RE.test(tenantId)) throw new HttpError(404, "Tenant not found");

  const row = await tenantRepository.findTenantWithMembership(tenantId, c.get("user").id);
  if (!row) throw new HttpError(404, "Tenant not found");

  c.set("tenant", row.tenant);
  c.set("membership", row.membership);
  await next();
});

/** Requires a manager role (owner/admin). Requires `requireTenant` before. */
export const requireManager = createMiddleware<AppEnv>(async (c, next) => {
  const membership = c.get("membership");
  if (!managerRoles.includes(membership.role)) {
    throw new HttpError(403, "Only administrators can do this");
  }
  await next();
});
