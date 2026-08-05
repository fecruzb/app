import { z } from "zod";
import { defineTool } from "@/agent/tool";
import { noteRepository } from "../repository";

export const getNoteTool = defineTool({
  name: "get_note",
  description: "Reads a full note (title and content) by id.",
  inputSchema: { id: z.string().uuid() },
  execute: async (ctx, { id }) => {
    const row = await noteRepository.find(ctx.tenantId, id);
    if (!row) throw new Error("Note not found — check the id with list_notes");
    return { id: row.note.id, title: row.note.title, content: row.note.content };
  },
});
