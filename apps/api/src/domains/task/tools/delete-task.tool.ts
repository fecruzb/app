import { z } from "zod";
import { defineTool } from "@/agent/tool";
import { taskRepository } from "../repository";

export const deleteTaskTool = defineTool({
  name: "delete_task",
  description: "Deletes a task by id. Only use when the user explicitly asks.",
  inputSchema: { id: z.string().uuid() },
  summarize: () => "Task deleted",
  execute: async (ctx, { id }) => {
    const task = await taskRepository.delete(ctx.tenantId, id);
    if (!task) throw new Error("Task not found — check the id with list_tasks");
    return { ok: true, title: task.title };
  },
});
