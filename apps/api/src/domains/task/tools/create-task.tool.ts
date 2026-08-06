import { z } from "zod";
import { defineTool } from "@/agent/tool";
import { taskRepository } from "../repository";

export const createTaskTool = defineTool({
  name: "create_task",
  description: "Creates a task in the tenant.",
  inputSchema: {
    title: z.string().trim().min(1).max(200),
    completed: z.boolean().default(false),
  },
  summarize: (args) => `Task created: ${args.title}`,
  execute: async (ctx, { title, completed }) => {
    const task = await taskRepository.insert({
      tenantId: ctx.tenantId,
      authorId: ctx.userId,
      title,
      completed,
    });
    return { id: task.id, title: task.title };
  },
});
