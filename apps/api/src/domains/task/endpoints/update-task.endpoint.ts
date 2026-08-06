import { taskInputSchema } from "@app/shared";
import { HttpError, parseBody, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toTaskDto } from "../dto";
import { taskRepository } from "../repository";

/**
 * Update a task
 *
 * `PATCH /api/tenants/:tenantId/tasks/:taskId`
 *
 * Updates title and completion for a task in the current tenant.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with the updated task DTO
 */
export async function updateTask(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, taskInputSchema);
  const tenantId = c.get("tenant").id;
  const taskId = uuidParam(c, "taskId");

  // -- Processing ------------------------------------------------------------
  const current = await taskRepository.find(tenantId, taskId);
  if (!current) throw new HttpError(404, "Task not found");

  const task = await taskRepository.update(tenantId, taskId, {
    title: data.title,
    completed: data.completed ?? current.task.completed,
  });
  const row = await taskRepository.find(tenantId, task!.id);

  // -- Output ----------------------------------------------------------------
  return c.json(toTaskDto(row!));
}
