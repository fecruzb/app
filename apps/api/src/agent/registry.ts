/**
 * Agent tool registry
 *
 * Joins the tools declared by each domain, plus the agent-owned tools that
 * call OpenAI directly (`agent/tools`). When creating a new domain, add its
 * array here.
 */
import { articleTools } from "@/domains/article/tools";
import { taskTools } from "@/domains/task/tools";
import { tenantTools } from "@/domains/tenant/tools";
import { agentTools } from "./tools";
import type { AgentTool } from "./tool";

export const allTools: AgentTool[] = [...tenantTools, ...taskTools, ...articleTools, ...agentTools];

const byName = new Map(allTools.map((tool) => [tool.name, tool]));

export function getTool(name: string): AgentTool | undefined {
  return byName.get(name);
}
