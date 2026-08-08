import { z } from "zod";
import { taskInputSchema } from "@app/shared";
import { defineTool, ToolError } from "@/agent/tool";
import { taskRepository } from "../repository";

/**
 * Update a task
 *
 * `update_task`
 *
 * Updates a task's title (required) and optionally its completed state.
 *
 * @returns `{ id, title, completed }` of the updated task
 */
export const updateTaskTool = defineTool({
  name: "update_task",
  description:
    "Updates a task's title (required) and optionally its completed state. To only toggle completed, use set_task_completed. Read with get_task first if you need the current title.",
  inputSchema: {
    id: z.string().uuid(),
    title: taskInputSchema.shape.title,
    completed: taskInputSchema.shape.completed,
  },
  progress: (args) => `Updating task: ${args.title}`,
  summarize: (args) => `Task updated: ${args.title}`,
  execute: async (ctx, { id, title, completed }) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId } = ctx;

    // -- Processing ------------------------------------------------------------
    const current = await taskRepository.find(tenantId, id);
    if (!current) throw new ToolError("Task not found — check the id with list_tasks");

    const task = await taskRepository.update(tenantId, id, {
      title,
      completed: completed ?? current.task.completed,
    });
    if (!task) throw new ToolError("Task not found — check the id with list_tasks");

    // -- Output ----------------------------------------------------------------
    return { id: task.id, title: task.title, completed: task.completed };
  },
});
