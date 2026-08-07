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
import { deleteTask } from "./task.delete.route";
import { getTask } from "./task.get.route";
import { updateTask } from "./task.patch.route";
import { createTask } from "./task.post.route";
import { listTasks } from "./tasks.get.route";

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
