// HTTP entrypoint: takes the app built in app.ts and starts the server.
import { serve } from "@hono/node-server";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { ensureMediaDir } from "@/domains/article/utils";
import { app } from "@/app";

// Local uploads need a real folder before serveStatic mounts (skipped when R2).
ensureMediaDir();

// Production (Render) requires 0.0.0.0; in dev we use 127.0.0.1 to avoid
// clashing with macOS AirPlay Receiver, which holds port 5000 on other interfaces.
const hostname = env.isProduction ? "0.0.0.0" : "127.0.0.1";

serve({ fetch: app.fetch, port: env.port, hostname }, (info) => {
  logger.info(`[api] running at http://localhost:${info.port}`);
});
