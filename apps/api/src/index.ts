import path from "node:path";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { hasOpenAiKey } from "./agent/openai";
import { env } from "./lib/env";
import { errorHandler } from "./lib/errors";
import { accountRoutes } from "./routes/account";
import { agentRoutes } from "./routes/agent";
import { authRoutes } from "./routes/auth";
import { inviteRoutes } from "./routes/invites";
import { noteRoutes } from "./routes/notes";
import { tenantRoutes } from "./routes/tenants";

const app = new Hono();

app.onError(errorHandler);
if (!env.isProduction) app.use(logger());

app.get("/api/health", (c) => c.json({ ok: true }));
app.get("/api/config", (c) =>
  c.json({ selfSignupEnabled: env.selfSignupEnabled, aiEnabled: hasOpenAiKey() }),
);

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
  console.log(`[api] rodando em http://localhost:${info.port}`);
});
