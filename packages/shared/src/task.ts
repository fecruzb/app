// Example resource — replace with your product's domain.
import { z } from "zod";

export const taskInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  completed: z.boolean().optional(),
});

export type TaskDto = {
  id: string;
  title: string;
  completed: boolean;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
};
