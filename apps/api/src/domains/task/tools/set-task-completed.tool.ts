import { z } from "zod";
import { defineTool, ToolError } from "@/agent/tool";
import { taskRepository } from "../repository";

/**
 * Set task completed
 *
 * `set_task_completed`
 *
 * Marks a task as done or not done by id in the current tenant.
 *
 * @returns `{ id, title, completed }` of the updated task
 */
export const setTaskCompletedTool = defineTool({
  name: "set_task_completed",
  description: "Marks a task as done or not done by id.",
  inputSchema: {
    id: z.string().uuid(),
    completed: z.boolean(),
  },
  progress: (args) => (args.completed ? "Completing task…" : "Reopening task…"),
  summarize: (args) => (args.completed ? "Task completed" : "Task reopened"),
  execute: async (ctx, { id, completed }) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId } = ctx;

    // -- Processing ------------------------------------------------------------
    const row = await taskRepository.find(tenantId, id);
    if (!row) throw new ToolError("Task not found — check the id with list_tasks");
    const task = await taskRepository.update(tenantId, id, {
      title: row.task.title,
      completed,
    });

    // -- Output ----------------------------------------------------------------
    return { id: task!.id, title: task!.title, completed: task!.completed };
  },
});
