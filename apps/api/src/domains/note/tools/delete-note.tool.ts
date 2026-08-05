import { z } from "zod";
import { defineTool, toolError, toolJson } from "../../agent/tool";
import { noteRepository } from "../repository";

export const deleteNoteTool = defineTool({
  name: "delete_note",
  description: "Apaga uma nota pelo id. Só use com pedido explícito do usuário.",
  inputSchema: { id: z.string().uuid() },
  summarize: () => "Nota apagada",
  execute: async (ctx, { id }) => {
    const note = await noteRepository.delete(ctx.tenantId, id);
    if (!note) return toolError("Nota não encontrada — confira o id com list_notes");
    return toolJson({ ok: true, title: note.title });
  },
});
