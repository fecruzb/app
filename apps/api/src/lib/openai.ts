import OpenAI from "openai";
import { env } from "./env";

export function hasOpenAiKey(): boolean {
  return Boolean(env.openaiApiKey);
}

export function getOpenAI(): OpenAI {
  if (!env.openaiApiKey) throw new Error("OPENAI_API_KEY não configurada (esperada em .env)");
  return new OpenAI({ apiKey: env.openaiApiKey });
}
