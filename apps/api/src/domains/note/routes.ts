// Note domain route map (mounted at /api/tenants/:tenantId/notes).
// Copy this domain as the base for your product's resources.
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { requireTenant } from "@/domains/tenant/middleware";
import { createNote } from "./endpoints/create-note.endpoint";
import { deleteNote } from "./endpoints/delete-note.endpoint";
import { getNote } from "./endpoints/get-note.endpoint";
import { listNotes } from "./endpoints/list-notes.endpoint";
import { updateNote } from "./endpoints/update-note.endpoint";

export const noteRoutes = new Hono<AppEnv>()
  .use("*", requireAuth, requireTenant)
  .get("/", listNotes)
  .post("/", createNote)
  .get("/:noteId", getNote)
  .patch("/:noteId", updateNote)
  .delete("/:noteId", deleteNote);
