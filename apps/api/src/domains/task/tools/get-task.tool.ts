import { z } from "zod";
import { defineTool } from "@/agent/tool";
import { taskRepository } from "../repository";

export const getTaskTool = defineTool({
  name: "get_task",
  description: "Reads a task (title and completed state) by id.",
  inputSchema: { id: z.string().uuid() },
  execute: async (ctx, { id }) => {
    const row = await taskRepository.find(ctx.tenantId, id);
    if (!row) throw new Error("Task not found — check the id with list_tasks");
    return { id: row.task.id, title: row.task.title, completed: row.task.completed };
  },
});
