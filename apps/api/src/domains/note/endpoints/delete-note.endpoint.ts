import { uuidParam } from "../../../lib/errors";
import type { AppContext } from "../../../lib/http";
import { noteRepository } from "../repository";

export async function deleteNote(c: AppContext) {
  await noteRepository.delete(c.get("tenant").id, uuidParam(c, "noteId"));
  return c.json({ ok: true });
}
