/**
 * Account routes
 *
 * Wires handlers into the Hono route group. Tenant-independent. Individual
 * handlers live in `*.route.ts` beside this file.
 *
 * API keys: HTTP lives here; the `api_keys` table and mint/resolve logic stay
 * in `domains/auth` (credentials). See api-structure.mdc.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { listApiKeys } from "./api-keys.get.route";
import { revokeApiKey } from "./api-keys.key.delete.route";
import { createApiKey } from "./api-keys.post.route";
import { changePassword } from "./password.patch.route";
import { updateProfile } from "./profile.patch.route";

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
