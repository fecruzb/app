// Builds the HTTP application: middlewares, API routes and, in production,
// the SPA. No socket here (that's server.ts), so `app` can be imported in
// tests without starting a server.
import path from "node:path";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { logger as honoLogger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { env } from "@/lib/env";
import { errorHandler } from "@/lib/errors";
import { hasOpenAiKey } from "@/integrations/openai";
import { mcpHttp } from "@/agent/mcp-http";
import { agentRoutes } from "@/agent/routes";
import { accountRoutes } from "@/domains/account/routes";
import { authRoutes } from "@/domains/auth/routes";
import { taskRoutes } from "@/domains/task/routes";
import { inviteRoutes, tenantRoutes } from "@/domains/tenant/routes";

export const app = new Hono();

app.onError(errorHandler);
app.use(secureHeaders());
if (!env.isProduction) app.use(honoLogger());

// Unauthenticated utilities: health check and the public config the frontend reads on boot.
app.get("/api/health", (c) => c.json({ ok: true }));
app.get("/api/config", (c) =>
  c.json({ selfSignupEnabled: env.selfSignupEnabled, aiEnabled: hasOpenAiKey() }),
);

// Remote MCP over HTTP, authenticated by a personal API key (Bearer token).
app.all("/api/mcp", mcpHttp);

app.route("/api/auth", authRoutes);
app.route("/api/account", accountRoutes);
app.route("/api/tenants", tenantRoutes);
app.route("/api/tenants/:tenantId/tasks", taskRoutes);
app.route("/api/tenants/:tenantId/agent", agentRoutes);
app.route("/api/invites", inviteRoutes);

// In production the API serves the built SPA (single origin → simple cookies).
// In dev, Vite runs separately and proxies /api here.
if (env.isProduction) {
  const webDist = path.resolve(import.meta.dirname, "../../web/dist");
  const root = path.relative(process.cwd(), webDist);
  app.use("*", serveStatic({ root }));
  app.get("*", serveStatic({ root, path: "index.html" }));
}
