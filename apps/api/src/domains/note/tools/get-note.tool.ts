import { z } from "zod";
import { defineTool, toolError, toolJson } from "../../agent/tool";
import { noteRepository } from "../repository";

export const getNoteTool = defineTool({
  name: "get_note",
  description: "Lê uma nota completa (título e conteúdo) pelo id.",
  inputSchema: { id: z.string().uuid() },
  execute: async (ctx, { id }) => {
    const row = await noteRepository.find(ctx.tenantId, id);
    if (!row) return toolError("Nota não encontrada — confira o id com list_notes");
    return toolJson({ id: row.note.id, title: row.note.title, content: row.note.content });
  },
});
