import { z } from "zod";
import { defineTool } from "@/agent/tool";
import { taskRepository } from "../repository";

export const setTaskCompletedTool = defineTool({
  name: "set_task_completed",
  description: "Marks a task as done or not done by id.",
  inputSchema: {
    id: z.string().uuid(),
    completed: z.boolean(),
  },
  summarize: (args) => (args.completed ? "Task completed" : "Task reopened"),
  execute: async (ctx, { id, completed }) => {
    const row = await taskRepository.find(ctx.tenantId, id);
    if (!row) throw new Error("Task not found — check the id with list_tasks");
    const task = await taskRepository.update(ctx.tenantId, id, {
      title: row.task.title,
      completed,
    });
    return { id: task!.id, title: task!.title, completed: task!.completed };
  },
});
