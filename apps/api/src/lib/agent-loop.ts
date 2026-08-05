// Mecânica genérica de tool-calling da OpenAI: dado um conjunto de tools e a
// conversa, roda o loop (modelo → tool calls → resultados → modelo) até o
// modelo responder sem chamar tools. Não sabe nada do produto — a "policy"
// (system prompt, quais tools) vive no domínio (domains/agent).
import type OpenAI from "openai";
import { z, type ZodRawShape } from "zod";
import { getOpenAI } from "./openai";

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

  const chat: Message[] = [
    { role: "system", content: opts.system },
    ...opts.messages,
  ];
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

  return { reply: "Não consegui concluir dentro do limite de passos.", calls };
}
