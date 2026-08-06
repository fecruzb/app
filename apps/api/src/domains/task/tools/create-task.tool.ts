import { z } from "zod";
import { taskInputSchema } from "@app/shared";
import { defineTool } from "@/agent/tool";
import { taskRepository } from "../repository";

/**
 * Create a task
 *
 * `create_task`
 *
 * Creates a task in the current tenant for the acting user.
 *
 * @returns `{ id, title }` of the created task
 */
export const createTaskTool = defineTool({
  name: "create_task",
  description: "Creates a task in the tenant.",
  inputSchema: {
    title: taskInputSchema.shape.title,
    completed: z.boolean().default(false),
  },
  summarize: (args) => `Task created: ${args.title}`,
  execute: async (ctx, { title, completed }) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId, userId } = ctx;

    // -- Processing ------------------------------------------------------------
    const task = await taskRepository.insert({
      tenantId,
      authorId: userId,
      title,
      completed,
    });

    // -- Output ----------------------------------------------------------------
    return { id: task.id, title: task.title };
  },
});
