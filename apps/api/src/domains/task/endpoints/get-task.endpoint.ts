import { HttpError, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toTaskDto } from "../dto";
import { taskRepository } from "../repository";

/**
 * Get a task
 *
 * `GET /api/tenants/:tenantId/tasks/:taskId`
 *
 * Loads a single task by id within the current tenant.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with the task DTO
 */
export async function getTask(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const tenantId = c.get("tenant").id;
  const taskId = uuidParam(c, "taskId");

  // -- Processing ------------------------------------------------------------
  const row = await taskRepository.find(tenantId, taskId);
  if (!row) throw new HttpError(404, "Task not found");

  // -- Output ----------------------------------------------------------------
  return c.json(toTaskDto(row));
}
