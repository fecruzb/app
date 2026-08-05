import path from "node:path";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { logger as honoLogger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { env } from "@/lib/env";
import { errorHandler } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { accountRoutes } from "@/domains/account/routes";
import { agentRoutes } from "@/domains/agent/routes";
import { authRoutes } from "@/domains/auth/routes";
import { noteRoutes } from "@/domains/note/routes";
import { systemRoutes } from "@/domains/system/routes";
import { inviteRoutes, tenantRoutes } from "@/domains/tenant/routes";

const app = new Hono();

app.onError(errorHandler);
app.use(secureHeaders());
if (!env.isProduction) app.use(honoLogger());

app.route("/api", systemRoutes);
app.route("/api/auth", authRoutes);
app.route("/api/account", accountRoutes);
app.route("/api/tenants", tenantRoutes);
app.route("/api/tenants/:tenantId/notes", noteRoutes);
app.route("/api/tenants/:tenantId/agent", agentRoutes);
app.route("/api/invites", inviteRoutes);

// Em produção a API serve o SPA buildado (uma origem só → cookies simples).
// Em dev o Vite roda à parte e proxeia /api para cá.
if (env.isProduction) {
  const webDist = path.resolve(import.meta.dirname, "../../web/dist");
  const root = path.relative(process.cwd(), webDist);
  app.use("*", serveStatic({ root }));
  app.get("*", serveStatic({ root, path: "index.html" }));
}

// Produção (Render) exige 0.0.0.0; em dev usamos 127.0.0.1 para não conflitar
// com o AirPlay Receiver do macOS, que ocupa a porta 5000 em outras interfaces.
const hostname = env.isProduction ? "0.0.0.0" : "127.0.0.1";

serve({ fetch: app.fetch, port: env.port, hostname }, (info) => {
  logger.info(`[api] rodando em http://localhost:${info.port}`);
});
