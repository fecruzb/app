import type { AgentTool } from "@/agent/tool";
import { getTenantTool } from "./get-tenant.tool";

export const tenantTools: AgentTool[] = [getTenantTool];
