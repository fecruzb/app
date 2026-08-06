import { z } from "zod";
import { defineTool } from "@/agent/tool";
import { taskRepository } from "../repository";

export const listTasksTool = defineTool({
  name: "list_tasks",
  description:
    "Lists the tenant's tasks (id, title, completed, updated at). Use search to filter by a title substring.",
  inputSchema: { search: z.string().optional() },
  execute: async (ctx, { search }) => {
    const rows = await taskRepository.list(ctx.tenantId, search);
    return rows.map((r) => ({
      id: r.task.id,
      title: r.task.title,
      completed: r.task.completed,
      updatedAt: r.task.updatedAt.toISOString(),
    }));
  },
});
