import { noteInputSchema } from "@app/shared";
import { HttpError, parseBody, uuidParam } from "../../../lib/errors";
import type { AppContext } from "../../../lib/http";
import { toNoteDto } from "../dto";
import { noteRepository } from "../repository";

export async function updateNote(c: AppContext) {
  const data = await parseBody(c, noteInputSchema);
  const tenantId = c.get("tenant").id;

  const note = await noteRepository.update(tenantId, uuidParam(c, "noteId"), data);
  if (!note) throw new HttpError(404, "Nota não encontrada");

  const row = await noteRepository.find(tenantId, note.id);
  return c.json(toNoteDto(row!));
}
