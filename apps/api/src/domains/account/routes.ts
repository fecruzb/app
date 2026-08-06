// Logged-in user's account (profile and password) — tenant-independent.
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { changePassword } from "./endpoints/change-password.endpoint";
import { createApiKeyEndpoint } from "./endpoints/create-api-key.endpoint";
import { listApiKeysEndpoint } from "./endpoints/list-api-keys.endpoint";
import { revokeApiKeyEndpoint } from "./endpoints/revoke-api-key.endpoint";
import { updateProfile } from "./endpoints/update-profile.endpoint";

export const accountRoutes = new Hono<AppEnv>()
  .use("*", requireAuth)
  .patch("/", updateProfile)
  .patch("/password", changePassword)
  .get("/api-keys", listApiKeysEndpoint)
  .post("/api-keys", createApiKeyEndpoint)
  .delete("/api-keys/:keyId", revokeApiKeyEndpoint);
