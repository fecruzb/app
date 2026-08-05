import { z } from "zod";
import { defineTool } from "@/agent/tool";
import { noteRepository } from "../repository";

export const listNotesTool = defineTool({
  name: "list_notes",
  description:
    "Lista as notas do tenant (id, título, autor, atualização). Use search para filtrar por trecho do título.",
  inputSchema: { search: z.string().optional() },
  execute: async (ctx, { search }) => {
    const rows = await noteRepository.list(ctx.tenantId, search);
    return rows.map((r) => ({
      id: r.note.id,
      title: r.note.title,
      authorName: r.authorName,
      updatedAt: r.note.updatedAt.toISOString(),
    }));
  },
});
