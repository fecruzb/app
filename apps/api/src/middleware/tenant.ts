import { and, eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { managerRoles } from "@app/shared";
import { db } from "../db/client";
import { tenantMembers, tenants } from "../db/schema";
import { HttpError } from "../lib/errors";
import type { AppEnv } from "./auth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve o tenant do param `:tenantId` e valida que o usuário logado é
 * membro. Todo o isolamento de dados parte daqui: handlers usam
 * `c.get("tenant").id`, nunca um tenant id vindo do body.
 * Requer `requireAuth` antes.
 */
export const requireTenant = createMiddleware<AppEnv>(async (c, next) => {
  const tenantId = c.req.param("tenantId");
  if (!tenantId || !UUID_RE.test(tenantId)) throw new HttpError(404, "Tenant não encontrado");

  const user = c.get("user");
  const [row] = await db
    .select({ tenant: tenants, membership: tenantMembers })
    .from(tenantMembers)
    .innerJoin(tenants, eq(tenants.id, tenantMembers.tenantId))
    .where(and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.userId, user.id)));

  if (!row) throw new HttpError(404, "Tenant não encontrado");

  c.set("tenant", row.tenant);
  c.set("membership", row.membership);
  await next();
});

/** Exige role de gestão (owner/admin). Requer `requireTenant` antes. */
export const requireManager = createMiddleware<AppEnv>(async (c, next) => {
  const membership = c.get("membership");
  if (!managerRoles.includes(membership.role)) {
    throw new HttpError(403, "Apenas administradores podem fazer isso");
  }
  await next();
});
