/**
 * Account routes
 *
 * Wires handlers into the Hono route group. Tenant-independent. Individual
 * handlers live in `*.route.ts` beside this file.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { changePassword } from "./change-password.route";
import { createApiKey } from "./create-api-key.route";
import { listApiKeys } from "./list-api-keys.route";
import { revokeApiKey } from "./revoke-api-key.route";
import { updateProfile } from "./update-profile.route";

/**
 * Account route group
 *
 * Mounted at `/api/account`. Requires a session.
 */
export const accountRoutes = new Hono<AppEnv>()
  .use("*", requireAuth)
  .patch("/", updateProfile)
  .patch("/password", changePassword)
  .get("/api-keys", listApiKeys)
  .post("/api-keys", createApiKey)
  .delete("/api-keys/:keyId", revokeApiKey);
