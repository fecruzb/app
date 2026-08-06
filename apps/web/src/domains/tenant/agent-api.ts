import type { AgentMessage, AgentResult } from "@app/shared";
import { api } from "@/lib/api";

export const agentApi = {
  chat: (tenantId: string, messages: AgentMessage[]) =>
    api.post<AgentResult>(`/tenants/${tenantId}/agent`, { messages }),
};
