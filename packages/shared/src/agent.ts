import { z } from "zod";

export const agentMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

export const agentChatSchema = z.object({
  messages: z.array(agentMessageSchema).min(1).max(40),
});

export type AgentMessage = z.infer<typeof agentMessageSchema>;

/** Ação de escrita executada pelo agente, exibida como chip na UI. */
export type AgentAction = {
  tool: string;
  summary: string;
  isError: boolean;
};

export type AgentResult = {
  reply: string;
  actions: AgentAction[];
};
