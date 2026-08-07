import { z } from "zod";

export const agentMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

export const agentChatSchema = z.object({
  messages: z.array(agentMessageSchema).min(1).max(40),
});

/** Optional body for `POST …/agent/articles/:articleId/cover`. */
export const generateArticleCoverSchema = z.object({
  prompt: z.string().trim().min(1).max(2000).optional(),
});

export type AgentMessage = z.infer<typeof agentMessageSchema>;
export type GenerateArticleCoverInput = z.infer<typeof generateArticleCoverSchema>;

/** Write action executed by the agent, shown as a chip in the UI. */
export type AgentAction = {
  tool: string;
  summary: string;
  isError: boolean;
};

export type AgentResult = {
  reply: string;
  actions: AgentAction[];
};

/**
 * One line of the NDJSON chat stream (`POST …/agent`).
 * Progress events arrive while the tool loop runs; `done` or `error` ends it.
 */
export type AgentStreamEvent =
  | { type: "status"; status: "thinking" | "working" }
  | { type: "tool_start"; id: string; tool: string; summary: string }
  | { type: "tool_done"; id: string; summary: string; isError: boolean }
  | ({ type: "done" } & AgentResult)
  | { type: "error"; error: string };

/** Voice input: what the user dictated, ready to be sent as a message. */
export type AgentTranscriptDto = {
  text: string;
};
