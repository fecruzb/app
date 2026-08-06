import { agentChatSchema } from "@app/shared";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { hasOpenAiKey } from "@/integrations/openai";
import { usageRepository } from "@/domains/usage/repository";
import { assertAiBudget } from "@/domains/billing/service";
import { runAssistant } from "../assistant";

/**
 * Chat with the assistant
 *
 * `POST /api/tenants/:tenantId/agent`
 *
 * Runs the in-app assistant for the current tenant user, enforces the AI
 * budget, records usage, and returns the assistant result.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with the assistant response payload
 */
export async function chat(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  if (!hasOpenAiKey()) {
    throw new HttpError(503, "Agent unavailable — set OPENAI_API_KEY");
  }
  const { messages } = await parseBody(c, agentChatSchema);
  const tenant = c.get("tenant");
  const user = c.get("user");
  const role = c.get("membership").role;

  // -- Processing ------------------------------------------------------------
  await assertAiBudget(user.id, tenant.id);

  const { usage, ...result } = await runAssistant(
    {
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      userId: user.id,
      userName: user.name,
      role,
    },
    messages,
  );

  await usageRepository.insert({ userId: user.id, tenantId: tenant.id, ...usage });

  // -- Output ----------------------------------------------------------------
  return c.json(result);
}
