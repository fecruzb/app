import { defineTool, toolJson } from "../../agent/tool";
import { tenantRepository } from "../repository";

export const getTenantTool = defineTool({
  name: "get_tenant",
  description:
    "Informações do tenant atual: nome, slug, role do usuário e lista de membros com roles.",
  inputSchema: {},
  execute: async (ctx) => {
    const members = await tenantRepository.listMembers(ctx.tenantId);
    return toolJson({
      name: ctx.tenantName,
      slug: ctx.tenantSlug,
      yourRole: ctx.role,
      members: members.map((m) => ({ name: m.name, email: m.email, role: m.role })),
    });
  },
});
