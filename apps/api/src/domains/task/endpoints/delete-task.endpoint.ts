import { HttpError, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { taskRepository } from "../repository";

export async function deleteTask(c: AppContext) {
  const task = await taskRepository.delete(c.get("tenant").id, uuidParam(c, "taskId"));
  if (!task) throw new HttpError(404, "Task not found");
  return c.json({ ok: true });
}
