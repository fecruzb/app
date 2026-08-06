// MCP server stdio entry — for Cursor, Claude and other MCP clients.
//
// Usage: npm run mcp   (registered in .cursor/mcp.json)
//
// There is no HTTP session here, so context is resolved locally: the tenant
// comes from MCP_TENANT_SLUG (default: oldest in the database) and writes are
// authored by that tenant's first owner.
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { tenantRepository } from "@/domains/tenant/repository";
import { createMcpServer } from "./mcp-server";

const slug = process.env.MCP_TENANT_SLUG;
const tenant = slug ? await tenantRepository.findTenantBySlug(slug) : await tenantRepository.findOldestTenant();

if (!tenant) {
  console.error(
    slug ? `app-base-mcp: tenant "${slug}" does not exist` : "app-base-mcp: no tenants in database",
  );
  process.exit(1);
}

const owner = await tenantRepository.findFirstOwner(tenant.id);

const server = createMcpServer({
  tenantId: tenant.id,
  tenantName: tenant.name,
  tenantSlug: tenant.slug,
  userId: owner?.id ?? null,
  userName: owner?.name ?? "MCP",
  role: "owner",
});

await server.connect(new StdioServerTransport());
console.error(`app-base-mcp: ready (stdio, tenant "${tenant.slug}")`);
