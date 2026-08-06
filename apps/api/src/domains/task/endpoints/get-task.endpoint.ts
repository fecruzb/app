import { HttpError, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toTaskDto } from "../dto";
import { taskRepository } from "../repository";

export async function getTask(c: AppContext) {
  const row = await taskRepository.find(c.get("tenant").id, uuidParam(c, "taskId"));
  if (!row) throw new HttpError(404, "Task not found");
  return c.json(toTaskDto(row));
}
