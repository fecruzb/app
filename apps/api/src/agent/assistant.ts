/**
 * In-app assistant
 *
 * Takes the floating-button conversation and answers using the registry tools
 * (the same ones exposed via MCP). This is the product policy — who the agent
 * is and how it acts; the tool-calling loop lives in integrations/openai.
 */
import { z } from "zod";
import type { AgentMessage, AgentResult } from "@app/shared";
import { runToolLoop, type AiUsage, type LoopTool } from "@/integrations/openai";
import { env } from "@/lib/env";
import { allTools, getTool } from "./registry";
import type { AgentContext } from "./tool";

/** The wire contract plus the token spend, which the route meters but never returns. */
export type AssistantResult = AgentResult & { usage: AiUsage };

function systemPrompt(ctx: AgentContext): string {
  return `You are the App Base assistant inside the tenant "${ctx.tenantName}". You are talking to ${ctx.userName} (role: ${ctx.role}).

You read and manage the tenant's content through the available tools (tenant info, members, tasks and articles).

How to act:
- Interpret the intent and act — don't ask for confirmation on simple, reversible actions (create a task or mark it done, create an article).
- Find real ids before writing: use list_tasks / list_articles. Never make up ids.
- To mark a task done or not done, use set_task_completed; to change its text, use update_task.
- Articles have a title, Markdown body, and optional cover image. Create with create_article (title + body), then generate_article_cover with a prompt based on the content. Put the returned coverUrl as plain text in your reply (no markdown link, no extra wrapping) so it renders inline.
- Only delete something (delete_task, delete_article) when explicitly asked.
- If a request is too ambiguous to act safely, say what's missing in one sentence.

Final answer: short and direct, without repeating technical ids.`;
}

/**
 * Run the assistant
 *
 * Executes the tool loop for the given conversation and returns the reply,
 * action chips, and token usage.
 *
 * @param ctx - Tenant and actor identity
 * @param messages - Conversation so far
 * @returns Reply, UI action chips, and usage for metering
 */
export async function runAssistant(
  ctx: AgentContext,
  messages: AgentMessage[],
): Promise<AssistantResult> {
  const tools: LoopTool[] = allTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    run: async (rawArgs) => {
      const args = z.object(tool.inputSchema).parse(rawArgs);
      // Errors thrown by the tool are caught by runToolLoop and become isError.
      const data = await tool.execute(ctx, args);
      return { text: JSON.stringify(data ?? null), isError: false };
    },
  }));

  const { reply, calls, usage } = await runToolLoop({
    model: env.assistantModel,
    system: systemPrompt(ctx),
    messages,
    tools,
  });

  // Write tools (those with `summarize`) and errors become chips in the UI.
  const actions = calls.flatMap(({ name, args, text, isError }) => {
    const summarize = getTool(name)?.summarize;
    if (!isError && !summarize) return [];
    return [{ tool: name, summary: isError ? text : (summarize?.(args) ?? name), isError }];
  });

  return { reply, actions, usage };
}
