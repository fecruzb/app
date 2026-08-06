// Task domain route map (mounted at /api/tenants/:tenantId/tasks).
// Copy this domain as the base for your product's resources.
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { requireTenant } from "@/domains/tenant/middleware";
import { createTask } from "./endpoints/create-task.endpoint";
import { deleteTask } from "./endpoints/delete-task.endpoint";
import { getTask } from "./endpoints/get-task.endpoint";
import { listTasks } from "./endpoints/list-tasks.endpoint";
import { updateTask } from "./endpoints/update-task.endpoint";

export const taskRoutes = new Hono<AppEnv>()
  .use("*", requireAuth, requireTenant)
  .get("/", listTasks)
  .post("/", createTask)
  .get("/:taskId", getTask)
  .patch("/:taskId", updateTask)
  .delete("/:taskId", deleteTask);
