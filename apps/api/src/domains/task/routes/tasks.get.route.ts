import type { AppContext } from "@/context";
import { toTaskDto } from "../dto";
import { taskRepository } from "../repository";

/**
 * List tasks
 *
 * `GET /api/tenants/:tenantId/tasks`
 *
 * Returns tasks for the current tenant. Optional `?search=` filters by title.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with an array of task DTOs
 */
export async function listTasks(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const tenantId = c.get("tenant").id;
  const search = c.req.query("search")?.trim() || undefined;

  // -- Processing ------------------------------------------------------------
  const rows = await taskRepository.list(tenantId, search);

  // -- Output ----------------------------------------------------------------
  return c.json(rows.map(toTaskDto));
}
