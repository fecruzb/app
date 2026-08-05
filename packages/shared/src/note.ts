// Recurso de exemplo — troque pelo domínio do seu produto.
import { z } from "zod";

export const noteInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(20000),
});

export type NoteDto = {
  id: string;
  title: string;
  content: string;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
};
