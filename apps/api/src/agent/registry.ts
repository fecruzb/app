// Central registry: joins the tools declared by each domain, plus the
// agent-owned tools that call OpenAI directly (agent/tools).
// When creating a new domain, add its array here.
import { imageTools } from "@/domains/images/tools";
import { taskTools } from "@/domains/task/tools";
import { tenantTools } from "@/domains/tenant/tools";
import { agentTools } from "./tools";
import type { AgentTool } from "./tool";

export const allTools: AgentTool[] = [...tenantTools, ...taskTools, ...imageTools, ...agentTools];

const byName = new Map(allTools.map((tool) => [tool.name, tool]));

export function getTool(name: string): AgentTool | undefined {
  return byName.get(name);
}
