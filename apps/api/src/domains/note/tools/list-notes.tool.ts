import { z } from "zod";
import { defineTool } from "@/agent/tool";
import { noteRepository } from "../repository";

export const listNotesTool = defineTool({
  name: "list_notes",
  description:
    "Lists the tenant's notes (id, title, author, updated at). Use search to filter by a title substring.",
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
