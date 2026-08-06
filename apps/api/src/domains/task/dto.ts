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
