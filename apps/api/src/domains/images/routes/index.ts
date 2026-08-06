/**
 * Image routes
 *
 * Wires handlers into the Hono route group. Auth and tenant middleware run once
 * for the group. Individual handlers live in `*.route.ts` beside this file.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { requireTenant } from "@/domains/tenant/middleware";
import { deleteImage } from "./delete-image.route";
import { listImages } from "./list-images.route";
import { uploadImage } from "./upload-image.route";

/**
 * Image route group
 *
 * Mounted at `/api/tenants/:tenantId/images`.
 */
export const imageRoutes = new Hono<AppEnv>()
  .use("*", requireAuth, requireTenant)
  .get("/", listImages)
  .post("/", uploadImage)
  .delete("/:imageId", deleteImage);
