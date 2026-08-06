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
import { imageRoutes } from "@/domains/images/routes";
import { MEDIA_DIR, mediaPublicUrl, mediaStore, usingR2 } from "@/domains/images/media";
import { taskRoutes } from "@/domains/task/routes";
import { inviteRoutes, tenantRoutes } from "@/domains/tenant/routes";
import { usageRoutes } from "@/domains/usage/routes";

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
app.route("/api/usage", usageRoutes);
app.route("/api/tenants", tenantRoutes);
app.route("/api/tenants/:tenantId/tasks", taskRoutes);
app.route("/api/tenants/:tenantId/images", imageRoutes);
app.route("/api/tenants/:tenantId/agent", agentRoutes);
app.route("/api/invites", inviteRoutes);

// Uploaded images. R2 is checked first: an image regenerated in production
// must resolve to the bucket, not a stale local copy. Falls through to the
// local folder when the key isn't in the bucket (or R2 is off).
if (usingR2) {
  app.get("/media/*", async (c, next) => {
    const key = c.req.path.replace(/^\/media\//, "");
    const url = mediaPublicUrl(`/${key}`);
    if (url && (await mediaStore.has(key))) return c.redirect(url, 302);
    return next();
  });
}
app.use(
  "/media/*",
  serveStatic({
    root: path.relative(process.cwd(), MEDIA_DIR),
    rewriteRequestPath: (p) => p.replace(/^\/media/, ""),
  }),
);
app.get("/media/*", (c) => c.notFound());

// In production the API serves the built SPA (single origin → simple cookies).
// In dev, Vite runs separately and proxies /api here.
if (env.isProduction) {
  const webDist = path.resolve(import.meta.dirname, "../../web/dist");
  const root = path.relative(process.cwd(), webDist);
  app.use("*", serveStatic({ root }));
  app.get("*", serveStatic({ root, path: "index.html" }));
}
