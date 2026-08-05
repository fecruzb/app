// OpenAI integration: client, key check and the tool-calling loop
// (model → tool calls → results → model). The only place that knows the
// OpenAI API; swap the LLM provider here without touching the agent.
import OpenAI from "openai";
import { z, type ZodRawShape } from "zod";
import { env } from "@/lib/env";

export function hasOpenAiKey(): boolean {
  return Boolean(env.openaiApiKey);
}

export function getOpenAI(): OpenAI {
  if (!env.openaiApiKey) throw new Error("OPENAI_API_KEY not set (expected in .env)");
  return new OpenAI({ apiKey: env.openaiApiKey });
}

// -- tool-calling loop ---------------------------------------------------------

export type LoopTool = {
  name: string;
  description: string;
  inputSchema: ZodRawShape;
  run: (args: Record<string, unknown>) => Promise<{ text: string; isError: boolean }>;
};

export type ToolCallRecord = {
  name: string;
  args: Record<string, unknown>;
  text: string;
  isError: boolean;
};

export type LoopResult = { reply: string; calls: ToolCallRecord[] };

type Message = OpenAI.Chat.Completions.ChatCompletionMessageParam;

/**
 * Runs the loop until the model answers without calling tools. Knows nothing
 * about the product — the "policy" (system prompt, which tools) lives in agent/.
 */
export async function runToolLoop(opts: {
  model: string;
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  tools: LoopTool[];
  maxRounds?: number;
}): Promise<LoopResult> {
  const openai = getOpenAI();
  const byName = new Map(opts.tools.map((t) => [t.name, t]));

  const openaiTools: OpenAI.Chat.Completions.ChatCompletionTool[] = opts.tools.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: z.toJSONSchema(z.object(t.inputSchema)) as Record<string, unknown>,
    },
  }));

  const chat: Message[] = [{ role: "system", content: opts.system }, ...opts.messages];
  const calls: ToolCallRecord[] = [];

  for (let round = 0; round < (opts.maxRounds ?? 8); round++) {
    const response = await openai.chat.completions.create({
      model: opts.model,
      messages: chat,
      tools: openaiTools,
    });
    const message = response.choices[0]?.message;
    if (!message) break;
    chat.push(message);

    const toolCalls = message.tool_calls ?? [];
    if (toolCalls.length === 0) {
      return { reply: message.content?.trim() || "Feito.", calls };
    }

    for (const call of toolCalls) {
      if (call.type !== "function") continue;
      const args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
      const tool = byName.get(call.function.name);

      const { text, isError } = tool
        ? await tool.run(args).catch((err: unknown) => ({
            text: err instanceof Error ? err.message : String(err),
            isError: true,
          }))
        : { text: `Tool desconhecida: ${call.function.name}`, isError: true };

      calls.push({ name: call.function.name, args, text, isError });
      chat.push({ role: "tool", tool_call_id: call.id, content: text || "(vazio)" });
    }
  }

  return { reply: "I couldn't finish within the step limit.", calls };
}
