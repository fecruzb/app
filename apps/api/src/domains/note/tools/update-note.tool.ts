import { z } from "zod";
import { defineTool } from "@/agent/tool";
import { noteRepository } from "../repository";

export const updateNoteTool = defineTool({
  name: "update_note",
  description:
    "Updates a note's title and content. Send the full content (replaces the current one) — read it first with get_note.",
  inputSchema: {
    id: z.string().uuid(),
    title: z.string().trim().min(1).max(200),
    content: z.string().max(20000),
  },
  summarize: (args) => `Note updated: ${args.title}`,
  execute: async (ctx, { id, title, content }) => {
    const note = await noteRepository.update(ctx.tenantId, id, { title, content });
    if (!note) throw new Error("Note not found — check the id with list_notes");
    return { id: note.id, title: note.title };
  },
});
