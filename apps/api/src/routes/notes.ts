import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { noteInputSchema, type NoteDto } from "@app/shared";
import { db } from "../db/client";
import { notes, users } from "../db/schema";
import { HttpError, parseBody, uuidParam } from "../lib/errors";
import { requireAuth, type AppEnv } from "../middleware/auth";
import { requireTenant } from "../middleware/tenant";

// Recurso de exemplo mostrando o padrão CRUD por tenant, ponta a ponta.
// Copie este arquivo como base para os recursos do seu produto.

type NoteRow = { note: typeof notes.$inferSelect; authorName: string | null };

function toDto({ note, authorName }: NoteRow): NoteDto {
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

const baseQuery = () =>
  db
    .select({ note: notes, authorName: users.name })
    .from(notes)
    .leftJoin(users, eq(users.id, notes.authorId));

export const noteRoutes = new Hono<AppEnv>();

noteRoutes.use("*", requireAuth, requireTenant);

noteRoutes.get("/", async (c) => {
  const rows = await baseQuery()
    .where(eq(notes.tenantId, c.get("tenant").id))
    .orderBy(desc(notes.updatedAt));
  return c.json(rows.map(toDto));
});

noteRoutes.post("/", async (c) => {
  const data = await parseBody(c, noteInputSchema);
  const [note] = await db
    .insert(notes)
    .values({
      tenantId: c.get("tenant").id,
      authorId: c.get("user").id,
      title: data.title,
      content: data.content,
    })
    .returning();
  return c.json(toDto({ note, authorName: c.get("user").name }), 201);
});

noteRoutes.get("/:noteId", async (c) => {
  const [row] = await baseQuery().where(
    and(eq(notes.id, uuidParam(c, "noteId")), eq(notes.tenantId, c.get("tenant").id)),
  );
  if (!row) throw new HttpError(404, "Nota não encontrada");
  return c.json(toDto(row));
});

noteRoutes.patch("/:noteId", async (c) => {
  const data = await parseBody(c, noteInputSchema);
  const [note] = await db
    .update(notes)
    .set({ title: data.title, content: data.content, updatedAt: new Date() })
    .where(and(eq(notes.id, uuidParam(c, "noteId")), eq(notes.tenantId, c.get("tenant").id)))
    .returning();
  if (!note) throw new HttpError(404, "Nota não encontrada");
  const [row] = await baseQuery().where(eq(notes.id, note.id));
  return c.json(toDto(row));
});

noteRoutes.delete("/:noteId", async (c) => {
  await db
    .delete(notes)
    .where(and(eq(notes.id, uuidParam(c, "noteId")), eq(notes.tenantId, c.get("tenant").id)));
  return c.json({ ok: true });
});
