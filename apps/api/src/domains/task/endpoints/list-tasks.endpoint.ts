import type { AppContext } from "@/context";
import { toTaskDto } from "../dto";
import { taskRepository } from "../repository";

/**
 * List tasks
 *
 * `GET /api/tenants/:tenantId/tasks`
 *
 * Returns all tasks for the current tenant.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with an array of task DTOs
 */
export async function listTasks(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const tenantId = c.get("tenant").id;

  // -- Processing ------------------------------------------------------------
  const rows = await taskRepository.list(tenantId);

  // -- Output ----------------------------------------------------------------
  return c.json(rows.map(toTaskDto));
}
