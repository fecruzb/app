import type { AppContext } from "@/lib/http";
import { toNoteDto } from "../dto";
import { noteRepository } from "../repository";

export async function listNotes(c: AppContext) {
  const rows = await noteRepository.list(c.get("tenant").id);
  return c.json(rows.map(toNoteDto));
}
