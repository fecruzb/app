// Servidor MCP do app-base — as capacidades do app expostas como tools.
//
// Cada instância nasce amarrada a um contexto (tenant + usuário), então todo
// acesso a dados já sai isolado por tenant, igual às rotas HTTP. Dois
// consumidores: o assistente embutido na API (assistant.ts, conectado em
// memória) e o entry stdio (mcp.ts, para Cursor e outros clientes MCP).
//
// Ao derivar um produto, registre aqui as tools do seu domínio — o padrão das
// tools de notes serve de modelo.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { and, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import type { TenantRole } from "@app/shared";
import { db } from "../db/client";
import { notes, tenantMembers, users } from "../db/schema";

export type AgentContext = {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  /** null quando rodando via stdio sem usuário (ex.: Cursor em dev). */
  userId: string | null;
  userName: string;
  role: TenantRole;
};

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
}

function fail(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

export function createMcpServer(ctx: AgentContext): McpServer {
  const server = new McpServer({ name: "app-base", version: "1.0.0" });

  // ---------------------------------------------------------------------
  // Tenant
  // ---------------------------------------------------------------------

  server.registerTool(
    "get_tenant",
    {
      description:
        "Informações do tenant atual: nome, slug, role do usuário e lista de membros com roles.",
      inputSchema: {},
    },
    async () => {
      const members = await db
        .select({ name: users.name, email: users.email, role: tenantMembers.role })
        .from(tenantMembers)
        .innerJoin(users, eq(users.id, tenantMembers.userId))
        .where(eq(tenantMembers.tenantId, ctx.tenantId));
      return json({
        name: ctx.tenantName,
        slug: ctx.tenantSlug,
        yourRole: ctx.role,
        members,
      });
    },
  );

  // ---------------------------------------------------------------------
  // Notes (recurso de exemplo — troque pelo domínio do seu produto)
  // ---------------------------------------------------------------------

  server.registerTool(
    "list_notes",
    {
      description:
        "Lista as notas do tenant (id, título, autor, atualização). Use search para filtrar por trecho do título.",
      inputSchema: { search: z.string().optional() },
    },
    async ({ search }) => {
      const where = search
        ? and(eq(notes.tenantId, ctx.tenantId), ilike(notes.title, `%${search}%`))
        : eq(notes.tenantId, ctx.tenantId);
      const rows = await db
        .select({ note: notes, authorName: users.name })
        .from(notes)
        .leftJoin(users, eq(users.id, notes.authorId))
        .where(where)
        .orderBy(desc(notes.updatedAt));
      return json(
        rows.map((r) => ({
          id: r.note.id,
          title: r.note.title,
          authorName: r.authorName,
          updatedAt: r.note.updatedAt.toISOString(),
        })),
      );
    },
  );

  server.registerTool(
    "get_note",
    {
      description: "Lê uma nota completa (título e conteúdo) pelo id.",
      inputSchema: { id: z.string().uuid() },
    },
    async ({ id }) => {
      const [note] = await db
        .select()
        .from(notes)
        .where(and(eq(notes.id, id), eq(notes.tenantId, ctx.tenantId)));
      if (!note) return fail("Nota não encontrada — confira o id com list_notes");
      return json({ id: note.id, title: note.title, content: note.content });
    },
  );

  server.registerTool(
    "create_note",
    {
      description: "Cria uma nota no tenant.",
      inputSchema: {
        title: z.string().trim().min(1).max(200),
        content: z.string().max(20000).default(""),
      },
    },
    async ({ title, content }) => {
      const [note] = await db
        .insert(notes)
        .values({ tenantId: ctx.tenantId, authorId: ctx.userId, title, content })
        .returning();
      return json({ id: note.id, title: note.title });
    },
  );

  server.registerTool(
    "update_note",
    {
      description:
        "Atualiza título e conteúdo de uma nota. Envie o conteúdo completo (substitui o atual) — leia antes com get_note.",
      inputSchema: {
        id: z.string().uuid(),
        title: z.string().trim().min(1).max(200),
        content: z.string().max(20000),
      },
    },
    async ({ id, title, content }) => {
      const [note] = await db
        .update(notes)
        .set({ title, content, updatedAt: new Date() })
        .where(and(eq(notes.id, id), eq(notes.tenantId, ctx.tenantId)))
        .returning();
      if (!note) return fail("Nota não encontrada — confira o id com list_notes");
      return json({ id: note.id, title: note.title });
    },
  );

  server.registerTool(
    "delete_note",
    {
      description: "Apaga uma nota pelo id. Só use com pedido explícito do usuário.",
      inputSchema: { id: z.string().uuid() },
    },
    async ({ id }) => {
      const [note] = await db
        .delete(notes)
        .where(and(eq(notes.id, id), eq(notes.tenantId, ctx.tenantId)))
        .returning();
      if (!note) return fail("Nota não encontrada — confira o id com list_notes");
      return json({ ok: true, title: note.title });
    },
  );

  return server;
}
