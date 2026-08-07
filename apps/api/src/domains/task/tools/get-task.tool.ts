import { z } from "zod";
import { defineTool, ToolError } from "@/agent/tool";
import { toTaskToolSummary } from "../dto";
import { taskRepository } from "../repository";

/**
 * Get a task
 *
 * `get_task`
 *
 * Reads a task's title and completed state by id in the current tenant.
 *
 * @returns `{ id, title, completed }` of the task
 */
export const getTaskTool = defineTool({
  name: "get_task",
  description: "Reads a task (title and completed state) by id.",
  inputSchema: { id: z.string().uuid() },
  execute: async (ctx, { id }) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId } = ctx;

    // -- Processing ------------------------------------------------------------
    const row = await taskRepository.find(tenantId, id);
    if (!row) throw new ToolError("Task not found — check the id with list_tasks");

    // -- Output ----------------------------------------------------------------
    return toTaskToolSummary(row);
  },
});
