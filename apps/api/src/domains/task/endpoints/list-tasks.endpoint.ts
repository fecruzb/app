import type { AppContext } from "@/context";
import { toTaskDto } from "../dto";
import { taskRepository } from "../repository";

export async function listTasks(c: AppContext) {
  const rows = await taskRepository.list(c.get("tenant").id);
  return c.json(rows.map(toTaskDto));
}
