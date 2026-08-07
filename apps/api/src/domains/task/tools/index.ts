/**
 * Task tools
 *
 * Agent tools for the task domain. Registered in `agent/registry.ts`.
 */
import type { AgentTool } from "@/agent/tool";
import { createTaskTool } from "./create-task.tool";
import { deleteTaskTool } from "./delete-task.tool";
import { getTaskTool } from "./get-task.tool";
import { listTasksTool } from "./list-tasks.tool";
import { setTaskCompletedTool } from "./set-task-completed.tool";
import { updateTaskTool } from "./update-task.tool";

export const taskTools: AgentTool[] = [
  listTasksTool,
  getTaskTool,
  createTaskTool,
  updateTaskTool,
  setTaskCompletedTool,
  deleteTaskTool,
];
