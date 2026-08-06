/**
 * Task routes
 *
 * Tenant-scoped task CRUD. Auth and tenant middleware run once for the group.
 * Handlers live in `endpoints/*`.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { requireTenant } from "@/domains/tenant/middleware";
import { createTask } from "./endpoints/create-task.endpoint";
import { deleteTask } from "./endpoints/delete-task.endpoint";
import { getTask } from "./endpoints/get-task.endpoint";
import { listTasks } from "./endpoints/list-tasks.endpoint";
import { updateTask } from "./endpoints/update-task.endpoint";

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
