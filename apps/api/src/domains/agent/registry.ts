// Registry central: junta as tools declaradas em cada domínio.
// Ao criar um domínio novo, adicione o array dele aqui.
import { noteTools } from "../note/tools";
import { tenantTools } from "../tenant/tools";
import type { AgentTool } from "./tool";

export const allTools: AgentTool[] = [...tenantTools, ...noteTools];

const byName = new Map(allTools.map((tool) => [tool.name, tool]));

export function getTool(name: string): AgentTool | undefined {
  return byName.get(name);
}
