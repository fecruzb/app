import type { AgentStreamEvent } from "@app/shared";
import { agentChatSchema } from "@app/shared";
import { HttpError, parseBody } from "@/lib/errors";
import { logger } from "@/lib/logger";
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
 * budget, records usage, and streams NDJSON progress events (tool loop + final
 * reply). Pre-stream failures stay JSON `{ error }` via HttpError.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 NDJSON stream of AgentStreamEvent lines
 */
export async function chat(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  if (!hasOpenAiKey()) {
    throw new HttpError(503, "AI is not configured on this server");
  }
  const { messages } = await parseBody(c, agentChatSchema);
  const tenant = c.get("tenant");
  const user = c.get("user");
  const role = c.get("membership").role;

  // -- Processing ------------------------------------------------------------
  await assertAiBudget(user.id, tenant.id);

  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream<Uint8Array>();
  const writer = writable.getWriter();

  const emit = async (event: AgentStreamEvent) => {
    await writer.write(encoder.encode(`${JSON.stringify(event)}\n`));
  };

  void (async () => {
    try {
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
        emit,
      );

      await usageRepository.insert({ userId: user.id, tenantId: tenant.id, ...usage });
      await emit({ type: "done", ...result });
    } catch (err) {
      const error = err instanceof HttpError ? err.message : "Internal server error";
      if (!(err instanceof HttpError)) logger.error("[agent/chat] stream failed:", err);
      try {
        await emit({ type: "error", error });
      } catch {
        // Stream already closed.
      }
    } finally {
      try {
        await writer.close();
      } catch {
        // Already closed.
      }
    }
  })();

  // -- Output ----------------------------------------------------------------
  return c.newResponse(readable, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
