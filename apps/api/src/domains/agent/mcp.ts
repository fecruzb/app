// Entry stdio do servidor MCP — para Cursor, Claude e outros clientes MCP.
//
// Uso: npm run mcp   (registrado em .cursor/mcp.json)
//
// Sem sessão HTTP não há usuário logado, então o contexto é resolvido aqui:
// o tenant vem de MCP_TENANT_SLUG (default: o mais antigo do banco) e o autor
// das escritas é o primeiro owner desse tenant.
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { tenantRepository } from "@/domains/tenant/repository";
import { createMcpServer } from "./mcp-server";

const slug = process.env.MCP_TENANT_SLUG;
const tenant = slug ? await tenantRepository.findBySlug(slug) : await tenantRepository.findOldest();

if (!tenant) {
  console.error(
    slug ? `app-base-mcp: tenant "${slug}" não existe` : "app-base-mcp: banco sem tenants",
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
console.error(`app-base-mcp: pronto (stdio, tenant "${tenant.slug}")`);
