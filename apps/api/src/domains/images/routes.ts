/**
 * Image routes
 *
 * Tenant-scoped image list, upload, and delete. Auth and tenant middleware run
 * once for the group. Handlers live in `endpoints/*`.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { requireTenant } from "@/domains/tenant/middleware";
import { deleteImage } from "./endpoints/delete-image.endpoint";
import { listImages } from "./endpoints/list-images.endpoint";
import { uploadImage } from "./endpoints/upload-image.endpoint";

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
