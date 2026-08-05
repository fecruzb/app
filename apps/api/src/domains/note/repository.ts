// Todo acesso a dados de notas passa por aqui. Repare que toda query filtra
// por tenantId — é assim que o isolamento multi-tenant se mantém.
import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "../../lib/db";
import { users } from "../auth/schema";
import { notes, type Note } from "./schema";

export type NoteWithAuthor = { note: Note; authorName: string | null };

const baseQuery = () =>
  db
    .select({ note: notes, authorName: users.name })
    .from(notes)
    .leftJoin(users, eq(users.id, notes.authorId));

export const noteRepository = {
  async list(tenantId: string, search?: string): Promise<NoteWithAuthor[]> {
    const where = search
      ? and(eq(notes.tenantId, tenantId), ilike(notes.title, `%${search}%`))
      : eq(notes.tenantId, tenantId);
    return baseQuery().where(where).orderBy(desc(notes.updatedAt));
  },

  async find(tenantId: string, noteId: string): Promise<NoteWithAuthor | null> {
    const [row] = await baseQuery().where(and(eq(notes.id, noteId), eq(notes.tenantId, tenantId)));
    return row ?? null;
  },

  async insert(values: {
    tenantId: string;
    authorId: string | null;
    title: string;
    content: string;
  }): Promise<Note> {
    const [note] = await db.insert(notes).values(values).returning();
    return note;
  },

  async update(
    tenantId: string,
    noteId: string,
    values: { title: string; content: string },
  ): Promise<Note | null> {
    const [note] = await db
      .update(notes)
      .set({ ...values, updatedAt: new Date() })
      .where(and(eq(notes.id, noteId), eq(notes.tenantId, tenantId)))
      .returning();
    return note ?? null;
  },

  async delete(tenantId: string, noteId: string): Promise<Note | null> {
    const [note] = await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.tenantId, tenantId)))
      .returning();
    return note ?? null;
  },
};
