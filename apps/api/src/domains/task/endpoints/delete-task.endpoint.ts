import { uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { taskRepository } from "../repository";

export async function deleteTask(c: AppContext) {
  await taskRepository.delete(c.get("tenant").id, uuidParam(c, "taskId"));
  return c.json({ ok: true });
}
