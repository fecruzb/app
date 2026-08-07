/**
 * Tenant tools
 *
 * Agent tools for the tenant domain. Registered in `agent/registry.ts`.
 */
import type { AgentTool } from "@/agent/tool";
import { getTenantTool } from "./get-tenant.tool";

export const tenantTools: AgentTool[] = [getTenantTool];
