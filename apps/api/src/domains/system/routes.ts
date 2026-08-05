// Endpoints utilitários do app, sem autenticação: health check e a config
// pública que o frontend lê no boot (flags de signup e IA).
import { Hono } from "hono";
import { env } from "@/lib/env";
import { hasOpenAiKey } from "@/integrations/openai";

export const systemRoutes = new Hono()
  .get("/health", (c) => c.json({ ok: true }))
  .get("/config", (c) =>
    c.json({ selfSignupEnabled: env.selfSignupEnabled, aiEnabled: hasOpenAiKey() }),
  );
