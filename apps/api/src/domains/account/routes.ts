/**
 * Account routes
 *
 * Logged-in user's profile, password, and API keys. Tenant-independent.
 * Handlers live in `endpoints/*`.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { changePassword } from "./endpoints/change-password.endpoint";
import { createApiKey } from "./endpoints/create-api-key.endpoint";
import { listApiKeys } from "./endpoints/list-api-keys.endpoint";
import { revokeApiKey } from "./endpoints/revoke-api-key.endpoint";
import { updateProfile } from "./endpoints/update-profile.endpoint";

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
