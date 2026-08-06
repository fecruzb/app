/**
 * Task routes
 *
 * Wires handlers into the Hono route group. Auth and tenant middleware run once
 * for the group. Individual handlers live in `*.route.ts` beside this file.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { requireTenant } from "@/domains/tenant/middleware";
import { createTask } from "./create-task.route";
import { deleteTask } from "./delete-task.route";
import { getTask } from "./get-task.route";
import { listTasks } from "./list-tasks.route";
import { updateTask } from "./update-task.route";

/**
 * Task route group
 *
 * Mounted at `/api/tenants/:tenantId/tasks`.
 */
export const taskRoutes = new Hono<AppEnv>()
  .use("*", requireAuth, requireTenant)
  .get("/", listTasks)
  .post("/", createTask)
  .get("/:taskId", getTask)
  .patch("/:taskId", updateTask)
  .delete("/:taskId", deleteTask);
