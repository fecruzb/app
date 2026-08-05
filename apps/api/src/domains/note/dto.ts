import type { NoteDto } from "@app/shared";
import type { NoteWithAuthor } from "./repository";

export function toNoteDto({ note, authorName }: NoteWithAuthor): NoteDto {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    authorId: note.authorId,
    authorName,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}
