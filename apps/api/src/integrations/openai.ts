// OpenAI integration: client, key check, audio transcription and the
// tool-calling loop (model → tool calls → results → model). The only place that
// knows the OpenAI API; swap the provider here without touching the agent.
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

// -- pricing -------------------------------------------------------------------

/** USD per 1M tokens. Keep in sync with https://openai.com/api/pricing/. */
type ModelPricing = { input: number; cachedInput: number; output: number };

const MODEL_PRICING: Record<string, ModelPricing> = {
  "gpt-4o-mini": { input: 0.15, cachedInput: 0.075, output: 0.6 },
  "gpt-4o": { input: 2.5, cachedInput: 1.25, output: 10 },
  "gpt-4.1": { input: 2, cachedInput: 0.5, output: 8 },
  "gpt-4.1-mini": { input: 0.4, cachedInput: 0.1, output: 1.6 },
  "gpt-4.1-nano": { input: 0.1, cachedInput: 0.025, output: 0.4 },
};

/** Unknown models bill at the priciest known rate so a wrong config never underbills. */
const FALLBACK_PRICING: ModelPricing = { input: 2.5, cachedInput: 1.25, output: 10 };

/** What a single billable request cost us — persisted by the caller. */
export type AiUsage = {
  model: string;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  /** Model calls behind this request: the loop can take several, audio takes one. */
  rounds: number;
  /** USD * 1_000_000, so spend stays in integers. */
  costMicros: number;
};

/** Prices are per 1M tokens, so `tokens * usdPerMillion` already yields micro-dollars. */
function costMicros(model: string, usage: Omit<AiUsage, "model" | "rounds" | "costMicros">) {
  const price = MODEL_PRICING[model] ?? FALLBACK_PRICING;
  const freshInput = Math.max(0, usage.inputTokens - usage.cachedInputTokens);
  return Math.round(
    freshInput * price.input +
      usage.cachedInputTokens * price.cachedInput +
      usage.outputTokens * price.output,
  );
}

// -- transcription -------------------------------------------------------------

/** USD per 1M tokens, plus the per-minute rate models billed by duration use. */
type TranscriptionPricing = {
  textInput: number;
  audioInput: number;
  output: number;
  perMinute: number;
};

const TRANSCRIPTION_PRICING: Record<string, TranscriptionPricing> = {
  "gpt-4o-mini-transcribe": { textInput: 1.25, audioInput: 3, output: 5, perMinute: 0.003 },
  "gpt-4o-transcribe": { textInput: 2.5, audioInput: 6, output: 10, perMinute: 0.006 },
  "whisper-1": { textInput: 0, audioInput: 0, output: 0, perMinute: 0.006 },
};

const FALLBACK_TRANSCRIPTION_PRICING: TranscriptionPricing = {
  textInput: 2.5,
  audioInput: 6,
  output: 10,
  perMinute: 0.006,
};

/**
 * Speech to text. Returns the transcript plus what it cost, in the same shape
 * the chat loop reports, so both feed the one usage ledger.
 */
export async function transcribeAudio(opts: {
  model: string;
  file: File;
}): Promise<{ text: string; usage: AiUsage }> {
  const openai = getOpenAI();
  const response = await openai.audio.transcriptions.create({
    file: opts.file,
    model: opts.model,
    response_format: "json",
  });

  const price = TRANSCRIPTION_PRICING[opts.model] ?? FALLBACK_TRANSCRIPTION_PRICING;
  const usage = response.usage;
  let inputTokens = 0;
  let outputTokens = 0;
  let cost = 0;

  if (usage?.type === "tokens") {
    inputTokens = usage.input_tokens;
    outputTokens = usage.output_tokens;
    const audioTokens = usage.input_token_details?.audio_tokens ?? usage.input_tokens;
    const textTokens = usage.input_token_details?.text_tokens ?? 0;
    cost =
      audioTokens * price.audioInput + textTokens * price.textInput + outputTokens * price.output;
  } else if (usage?.type === "duration") {
    cost = (usage.seconds / 60) * price.perMinute * 1_000_000;
  }
  // No usage in the response (older models) means we can't price it — the event
  // is still recorded, just at zero.

  return {
    text: response.text.trim(),
    usage: {
      model: opts.model,
      inputTokens,
      cachedInputTokens: 0,
      outputTokens,
      rounds: 1,
      costMicros: Math.round(cost),
    },
  };
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

export type LoopResult = { reply: string; calls: ToolCallRecord[]; usage: AiUsage };

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

  // A single user message can span several rounds — bill the sum of all of them.
  let inputTokens = 0;
  let cachedInputTokens = 0;
  let outputTokens = 0;
  let rounds = 0;
  const usage = (): AiUsage => ({
    model: opts.model,
    inputTokens,
    cachedInputTokens,
    outputTokens,
    rounds,
    costMicros: costMicros(opts.model, { inputTokens, cachedInputTokens, outputTokens }),
  });

  for (let round = 0; round < (opts.maxRounds ?? 8); round++) {
    const response = await openai.chat.completions.create({
      model: opts.model,
      messages: chat,
      tools: openaiTools,
    });
    rounds++;
    inputTokens += response.usage?.prompt_tokens ?? 0;
    cachedInputTokens += response.usage?.prompt_tokens_details?.cached_tokens ?? 0;
    outputTokens += response.usage?.completion_tokens ?? 0;

    const message = response.choices[0]?.message;
    if (!message) break;
    chat.push(message);

    const toolCalls = message.tool_calls ?? [];
    if (toolCalls.length === 0) {
      return { reply: message.content?.trim() || "Feito.", calls, usage: usage() };
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

  return { reply: "I couldn't finish within the step limit.", calls, usage: usage() };
}
