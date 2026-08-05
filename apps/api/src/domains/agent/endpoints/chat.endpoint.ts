import { agentChatSchema } from "@app/shared";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/lib/http";
import { hasOpenAiKey } from "@/integrations/openai";
import { runAssistant } from "../assistant";

export async function chat(c: AppContext) {
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
}
