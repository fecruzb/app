import { z } from "zod";
import { taskInputSchema } from "@app/shared";
import { defineTool } from "@/agent/tool";
import { taskRepository } from "../repository";

/**
 * Update a task
 *
 * `update_task`
 *
 * Updates a task's title and completed state in the current tenant.
 *
 * @returns `{ id, title, completed }` of the updated task
 */
export const updateTaskTool = defineTool({
  name: "update_task",
  description:
    "Updates a task's title and/or completed state. Read it first with get_task if you only want to change one field.",
  inputSchema: {
    id: z.string().uuid(),
    title: taskInputSchema.shape.title,
    completed: z.boolean(),
  },
  summarize: (args) => `Task updated: ${args.title}`,
  execute: async (ctx, { id, title, completed }) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId } = ctx;

    // -- Processing ------------------------------------------------------------
    const task = await taskRepository.update(tenantId, id, { title, completed });
    if (!task) throw new Error("Task not found — check the id with list_tasks");

    // -- Output ----------------------------------------------------------------
    return { id: task.id, title: task.title, completed: task.completed };
  },
});
