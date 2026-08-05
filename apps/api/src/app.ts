// Monta a aplicação HTTP: middlewares, rotas da API e, em produção, o SPA.
// É a "API" declarada — sem abrir socket (isso é o server.ts). Assim dá para
// importar `app` em testes sem subir o servidor.
import path from "node:path";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { logger as honoLogger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { env } from "@/lib/env";
import { errorHandler } from "@/lib/errors";
import { agentRoutes } from "@/agent/routes";
import { accountRoutes } from "@/domains/account/routes";
import { authRoutes } from "@/domains/auth/routes";
import { noteRoutes } from "@/domains/note/routes";
import { systemRoutes } from "@/domains/system/routes";
import { inviteRoutes, tenantRoutes } from "@/domains/tenant/routes";

export const app = new Hono();

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
