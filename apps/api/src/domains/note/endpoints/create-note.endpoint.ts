import { noteInputSchema } from "@app/shared";
import { parseBody } from "../../../lib/errors";
import type { AppContext } from "../../../lib/http";
import { toNoteDto } from "../dto";
import { noteRepository } from "../repository";

export async function createNote(c: AppContext) {
  const data = await parseBody(c, noteInputSchema);
  const note = await noteRepository.insert({
    tenantId: c.get("tenant").id,
    authorId: c.get("user").id,
    title: data.title,
    content: data.content,
  });
  return c.json(toNoteDto({ note, authorName: c.get("user").name }), 201);
}
