import { z } from "zod";
import { defineTool } from "@/agent/tool";
import { noteRepository } from "../repository";

export const deleteNoteTool = defineTool({
  name: "delete_note",
  description: "Deletes a note by id. Only use when the user explicitly asks.",
  inputSchema: { id: z.string().uuid() },
  summarize: () => "Note deleted",
  execute: async (ctx, { id }) => {
    const note = await noteRepository.delete(ctx.tenantId, id);
    if (!note) throw new Error("Note not found — check the id with list_notes");
    return { ok: true, title: note.title };
  },
});
