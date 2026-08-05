// Entry stdio do servidor MCP — para Cursor, Claude e outros clientes MCP.
//
// Uso: npm run mcp   (registrado em .cursor/mcp.json)
//
// Sem sessão HTTP não há usuário logado, então o contexto é resolvido aqui:
// o tenant vem de MCP_TENANT_SLUG (default: o mais antigo do banco) e o autor
// das escritas é o primeiro owner desse tenant.
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { and, asc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { tenantMembers, tenants, users } from "../db/schema";
import { createMcpServer } from "./mcp-server";

const slug = process.env.MCP_TENANT_SLUG;
const [tenant] = slug
  ? await db.select().from(tenants).where(eq(tenants.slug, slug))
  : await db.select().from(tenants).orderBy(asc(tenants.createdAt)).limit(1);

if (!tenant) {
  console.error(slug ? `app-base-mcp: tenant "${slug}" não existe` : "app-base-mcp: banco sem tenants");
  process.exit(1);
}

const [owner] = await db
  .select({ user: users })
  .from(tenantMembers)
  .innerJoin(users, eq(users.id, tenantMembers.userId))
  .where(and(eq(tenantMembers.tenantId, tenant.id), eq(tenantMembers.role, "owner")))
  .orderBy(asc(tenantMembers.createdAt))
  .limit(1);

const server = createMcpServer({
  tenantId: tenant.id,
  tenantName: tenant.name,
  tenantSlug: tenant.slug,
  userId: owner?.user.id ?? null,
  userName: owner?.user.name ?? "MCP",
  role: "owner",
});

await server.connect(new StdioServerTransport());
console.error(`app-base-mcp: pronto (stdio, tenant "${tenant.slug}")`);
