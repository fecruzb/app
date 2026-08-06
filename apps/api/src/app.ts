// Builds the HTTP application: middlewares, API routes and, in production,
// the SPA. No socket here (that's server.ts), so `app` can be imported in
// tests without starting a server.
import path from "node:path";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { env } from "@/lib/env";
import { errorHandler } from "@/lib/errors";
import { hasOpenAiKey } from "@/integrations/openai";
import type { AppConfig } from "@app/shared";
import { agentRoutes, mcpRoutes } from "@/agent/routes";
import { accountRoutes } from "@/domains/account/routes";
import { adminRoutes, joinRoutes } from "@/domains/admin/routes";
import { authRoutes } from "@/domains/auth/routes";
import { billingRoutes } from "@/domains/billing/routes";
import { imageRoutes } from "@/domains/images/routes";
import { MEDIA_DIR, mediaPublicUrl, mediaStore, usingR2 } from "@/domains/images/media";
import { taskRoutes } from "@/domains/task/routes";
import { inviteRoutes, tenantRoutes } from "@/domains/tenant/routes";

export const app = new Hono();

app.onError(errorHandler);
app.use(secureHeaders());
if (!env.isProduction) app.use(honoLogger());

// Credentialed CORS for Tauri shells (and local Vite). Off when CORS_ORIGIN is empty.
if (env.corsOrigins.size > 0) {
  app.use(
    "/api/*",
    cors({
      origin: (origin) => (origin && env.corsOrigins.has(origin) ? origin : null),
      credentials: true,
    }),
  );
}

// Unauthenticated utilities: health check and the public config the frontend reads on boot.
app.get("/api/health", (c) => c.json({ ok: true }));
app.get("/api/config", (c) =>
  c.json({
    selfSignupEnabled: env.selfSignupEnabled,
    aiEnabled: hasOpenAiKey(),
  } satisfies AppConfig),
);

app.route("/api/mcp", mcpRoutes);
app.route("/api/auth", authRoutes);
app.route("/api/account", accountRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/tenants", tenantRoutes);
app.route("/api/tenants/:tenantId/billing", billingRoutes);
app.route("/api/tenants/:tenantId/tasks", taskRoutes);
app.route("/api/tenants/:tenantId/images", imageRoutes);
app.route("/api/tenants/:tenantId/agent", agentRoutes);
app.route("/api/invites", inviteRoutes);
app.route("/api/join", joinRoutes);

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
