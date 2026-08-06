import { z } from "zod";
import { defineTool } from "@/agent/tool";
import { taskRepository } from "../repository";

export const updateTaskTool = defineTool({
  name: "update_task",
  description:
    "Updates a task's title and/or completed state. Read it first with get_task if you only want to change one field.",
  inputSchema: {
    id: z.string().uuid(),
    title: z.string().trim().min(1).max(200),
    completed: z.boolean(),
  },
  summarize: (args) => `Task updated: ${args.title}`,
  execute: async (ctx, { id, title, completed }) => {
    const task = await taskRepository.update(ctx.tenantId, id, { title, completed });
    if (!task) throw new Error("Task not found — check the id with list_tasks");
    return { id: task.id, title: task.title, completed: task.completed };
  },
});
