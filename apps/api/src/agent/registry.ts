// Central registry: joins the tools declared by each domain.
// When creating a new domain, add its array here.
import { taskTools } from "@/domains/task/tools";
import { tenantTools } from "@/domains/tenant/tools";
import type { AgentTool } from "./tool";

export const allTools: AgentTool[] = [...tenantTools, ...taskTools];

const byName = new Map(allTools.map((tool) => [tool.name, tool]));

export function getTool(name: string): AgentTool | undefined {
  return byName.get(name);
}
