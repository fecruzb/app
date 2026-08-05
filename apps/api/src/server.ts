// Entrypoint HTTP: pega o app montado em app.ts e sobe o servidor.
import { serve } from "@hono/node-server";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { app } from "@/app";

// Produção (Render) exige 0.0.0.0; em dev usamos 127.0.0.1 para não conflitar
// com o AirPlay Receiver do macOS, que ocupa a porta 5000 em outras interfaces.
const hostname = env.isProduction ? "0.0.0.0" : "127.0.0.1";

serve({ fetch: app.fetch, port: env.port, hostname }, (info) => {
  logger.info(`[api] rodando em http://localhost:${info.port}`);
});
