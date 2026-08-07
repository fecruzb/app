import { z } from "zod";
import { defineTool } from "@/agent/tool";
import { taskRepository } from "../repository";

/**
 * Delete a task
 *
 * `delete_task`
 *
 * Deletes a task by id in the current tenant.
 *
 * @returns `{ ok: true, title }` of the deleted task
 */
export const deleteTaskTool = defineTool({
  name: "delete_task",
  description: "Deletes a task by id. Only use when the user explicitly asks.",
  inputSchema: { id: z.string().uuid() },
  progress: () => "Deleting task…",
  summarize: () => "Task deleted",
  execute: async (ctx, { id }) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId } = ctx;

    // -- Processing ------------------------------------------------------------
    const task = await taskRepository.delete(tenantId, id);
    if (!task) throw new Error("Task not found — check the id with list_tasks");

    // -- Output ----------------------------------------------------------------
    return { ok: true, title: task.title };
  },
});
