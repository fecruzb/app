import { HttpError, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { taskRepository } from "../repository";

/**
 * Delete a task
 *
 * `DELETE /api/tenants/:tenantId/tasks/:taskId`
 *
 * Removes a task by id within the current tenant.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with `{ ok: true }`
 */
export async function deleteTask(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const tenantId = c.get("tenant").id;
  const taskId = uuidParam(c, "taskId");

  // -- Processing ------------------------------------------------------------
  const task = await taskRepository.delete(tenantId, taskId);
  if (!task) throw new HttpError(404, "Task not found");

  // -- Output ----------------------------------------------------------------
  return c.json({ ok: true });
}
