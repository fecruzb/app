import { HttpError, uuidParam } from "../../../lib/errors";
import type { AppContext } from "../../../lib/http";
import { toNoteDto } from "../dto";
import { noteRepository } from "../repository";

export async function getNote(c: AppContext) {
  const row = await noteRepository.find(c.get("tenant").id, uuidParam(c, "noteId"));
  if (!row) throw new HttpError(404, "Nota não encontrada");
  return c.json(toNoteDto(row));
}
