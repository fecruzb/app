import { defineTool } from "@/agent/tool";
import { toMemberDto } from "../dto";
import { tenantRepository } from "../repository";

/**
 * Get tenant
 *
 * `get_tenant`
 *
 * Returns the current tenant's name, slug, the acting user's role, and members.
 *
 * @returns Tenant info with `name`, `slug`, `yourRole`, and `members`
 */
export const getTenantTool = defineTool({
  name: "get_tenant",
  description:
    "Current tenant info: name, slug, the user's role and the list of members with roles.",
  inputSchema: {},
  execute: async (ctx) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId, tenantName, tenantSlug, role } = ctx;

    // -- Processing ------------------------------------------------------------
    const members = (await tenantRepository.listMembers(tenantId)).map(toMemberDto);

    // -- Output ----------------------------------------------------------------
    return {
      name: tenantName,
      slug: tenantSlug,
      yourRole: role,
      members: members.map((m) => ({ name: m.name, email: m.email, role: m.role })),
    };
  },
});
