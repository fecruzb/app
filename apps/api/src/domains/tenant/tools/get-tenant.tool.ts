import { defineTool } from "@/agent/tool";
import { tenantRepository } from "../repository";

export const getTenantTool = defineTool({
  name: "get_tenant",
  description:
    "Current tenant info: name, slug, the user's role and the list of members with roles.",
  inputSchema: {},
  execute: async (ctx) => {
    const members = await tenantRepository.listMembers(ctx.tenantId);
    return {
      name: ctx.tenantName,
      slug: ctx.tenantSlug,
      yourRole: ctx.role,
      members: members.map((m) => ({ name: m.name, email: m.email, role: m.role })),
    };
  },
});
