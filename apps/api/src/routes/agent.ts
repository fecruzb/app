import { Hono } from "hono";
import { agentChatSchema } from "@app/shared";
import { runAssistant } from "../agent/assistant";
import { hasOpenAiKey } from "../agent/openai";
import { HttpError, parseBody } from "../lib/errors";
import { requireAuth, type AppEnv } from "../middleware/auth";
import { requireTenant } from "../middleware/tenant";

export const agentRoutes = new Hono<AppEnv>();

agentRoutes.post("/", requireAuth, requireTenant, async (c) => {
  if (!hasOpenAiKey()) {
    throw new HttpError(503, "Agente indisponível — configure OPENAI_API_KEY");
  }
  const { messages } = await parseBody(c, agentChatSchema);
  const tenant = c.get("tenant");
  const user = c.get("user");

  const result = await runAssistant(
    {
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      userId: user.id,
      userName: user.name,
      role: c.get("membership").role,
    },
    messages,
  );
  return c.json(result);
});
