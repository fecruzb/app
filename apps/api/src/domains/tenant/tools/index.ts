import type { AgentTool } from "@/domains/agent/tool";
import { getTenantTool } from "./get-tenant.tool";

export const tenantTools: AgentTool[] = [getTenantTool];
