import { agentChatSchema } from "@app/shared";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { hasOpenAiKey } from "@/integrations/openai";
import { usageRepository } from "@/domains/usage/repository";
import { assertAiBudget } from "@/domains/usage/service";
import { runAssistant } from "../assistant";

export async function chat(c: AppContext) {
  if (!hasOpenAiKey()) {
    throw new HttpError(503, "Agent unavailable — set OPENAI_API_KEY");
  }
  const { messages } = await parseBody(c, agentChatSchema);
  const tenant = c.get("tenant");
  const user = c.get("user");

  await assertAiBudget(user.id);

  const { usage, ...result } = await runAssistant(
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

  await usageRepository.insert({ userId: user.id, tenantId: tenant.id, ...usage });
  return c.json(result);
}
