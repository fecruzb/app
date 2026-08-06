import { taskInputSchema } from "@app/shared";
import { parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toTaskDto } from "../dto";
import { taskRepository } from "../repository";

export async function createTask(c: AppContext) {
  const data = await parseBody(c, taskInputSchema);
  const task = await taskRepository.insert({
    tenantId: c.get("tenant").id,
    authorId: c.get("user").id,
    title: data.title,
    completed: data.completed ?? false,
  });
  return c.json(toTaskDto({ task, authorName: c.get("user").name }), 201);
}
