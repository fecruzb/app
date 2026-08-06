import { taskInputSchema } from "@app/shared";
import { parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toTaskDto } from "../dto";
import { taskRepository } from "../repository";

/**
 * Create a task
 *
 * `POST /api/tenants/:tenantId/tasks`
 *
 * Inserts a task for the current tenant, attributed to the authenticated user.
 *
 * @param c - Authenticated tenant request context
 * @returns 201 with the created task DTO
 */
export async function createTask(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, taskInputSchema);
  const tenant = c.get("tenant");
  const user = c.get("user");

  // -- Processing ------------------------------------------------------------
  const task = await taskRepository.insert({
    tenantId: tenant.id,
    authorId: user.id,
    title: data.title,
    completed: data.completed ?? false,
  });

  // -- Output ----------------------------------------------------------------
  return c.json(toTaskDto({ task, authorName: user.name }), 201);
}
