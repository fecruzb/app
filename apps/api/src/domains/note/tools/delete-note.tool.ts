import { z } from "zod";
import { defineTool } from "@/agent/tool";
import { noteRepository } from "../repository";

export const deleteNoteTool = defineTool({
  name: "delete_note",
  description: "Apaga uma nota pelo id. Só use com pedido explícito do usuário.",
  inputSchema: { id: z.string().uuid() },
  summarize: () => "Nota apagada",
  execute: async (ctx, { id }) => {
    const note = await noteRepository.delete(ctx.tenantId, id);
    if (!note) throw new Error("Nota não encontrada — confira o id com list_notes");
    return { ok: true, title: note.title };
  },
});
