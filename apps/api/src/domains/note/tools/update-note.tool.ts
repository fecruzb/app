import { z } from "zod";
import { defineTool, toolError, toolJson } from "@/domains/agent/tool";
import { noteRepository } from "../repository";

export const updateNoteTool = defineTool({
  name: "update_note",
  description:
    "Atualiza título e conteúdo de uma nota. Envie o conteúdo completo (substitui o atual) — leia antes com get_note.",
  inputSchema: {
    id: z.string().uuid(),
    title: z.string().trim().min(1).max(200),
    content: z.string().max(20000),
  },
  summarize: (args) => `Nota atualizada: ${args.title}`,
  execute: async (ctx, { id, title, content }) => {
    const note = await noteRepository.update(ctx.tenantId, id, { title, content });
    if (!note) return toolError("Nota não encontrada — confira o id com list_notes");
    return toolJson({ id: note.id, title: note.title });
  },
});
