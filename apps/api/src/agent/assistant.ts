// In-app assistant: takes the floating-button conversation and answers using
// the registry tools (the same ones exposed via MCP). This is the product
// "policy" — who the agent is and how it acts; the tool-calling loop lives in
// integrations/openai.
import { z } from "zod";
import type { AgentMessage, AgentResult } from "@app/shared";
import { runToolLoop, type LoopTool } from "@/integrations/openai";
import { env } from "@/lib/env";
import { allTools, getTool } from "./registry";
import type { AgentContext } from "./tool";

function systemPrompt(ctx: AgentContext): string {
  return `You are the App Base assistant inside the tenant "${ctx.tenantName}". You are talking to ${ctx.userName} (role: ${ctx.role}).

You read and manage the tenant's content through the available tools (tenant info, members and notes).

How to act:
- Interpret the intent and act — don't ask for confirmation on simple, reversible actions (create or edit a note).
- Find real ids before writing: use list_notes. Never make up ids.
- When editing a note, read it first with get_note and resend the full updated content.
- Only delete something (delete_note) when explicitly asked.
- If a request is too ambiguous to act safely, say what's missing in one sentence.

Final answer: short and direct, without repeating technical ids.`;
}

export async function runAssistant(
  ctx: AgentContext,
  messages: AgentMessage[],
): Promise<AgentResult> {
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

  const { reply, calls } = await runToolLoop({
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

  return { reply, actions };
}
