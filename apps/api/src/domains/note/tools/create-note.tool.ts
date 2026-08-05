import { z } from "zod";
import { defineTool } from "@/agent/tool";
import { noteRepository } from "../repository";

export const createNoteTool = defineTool({
  name: "create_note",
  description: "Cria uma nota no tenant.",
  inputSchema: {
    title: z.string().trim().min(1).max(200),
    content: z.string().max(20000).default(""),
  },
  summarize: (args) => `Nota criada: ${args.title}`,
  execute: async (ctx, { title, content }) => {
    const note = await noteRepository.insert({
      tenantId: ctx.tenantId,
      authorId: ctx.userId,
      title,
      content,
    });
    return { id: note.id, title: note.title };
  },
});
