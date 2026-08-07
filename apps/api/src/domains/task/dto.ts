/**
 * Task DTOs
 *
 * Maps task repository shapes to the shared task DTO.
 */
import type { TaskDto } from "@app/shared";
import type { TaskWithAuthor } from "./repository";

/**
 * To task DTO
 *
 * @param row - Task row with author display name from the join
 * @returns Shared task DTO
 */
export function toTaskDto({ task, authorName }: TaskWithAuthor): TaskDto {
  return {
    id: task.id,
    title: task.title,
    completed: task.completed,
    authorId: task.authorId,
    authorName,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

/** Slim task shape returned by agent tools (list/get). */
export type TaskToolSummary = {
  id: string;
  title: string;
  completed: boolean;
  updatedAt?: string;
};

/**
 * To task tool summary
 *
 * Compact JSON for the agent — omits author fields the model rarely needs.
 *
 * @param row - Task row with author (author ignored)
 * @param options - Whether to include `updatedAt` (list tools)
 * @returns Tool summary
 */
export function toTaskToolSummary(
  { task }: TaskWithAuthor,
  options: { includeUpdatedAt?: boolean } = {},
): TaskToolSummary {
  const summary: TaskToolSummary = {
    id: task.id,
    title: task.title,
    completed: task.completed,
  };
  if (options.includeUpdatedAt) summary.updatedAt = task.updatedAt.toISOString();
  return summary;
}
