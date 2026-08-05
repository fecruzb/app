// Logged-in user's account (profile and password) — tenant-independent.
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { changePassword } from "./endpoints/change-password.endpoint";
import { updateProfile } from "./endpoints/update-profile.endpoint";

export const accountRoutes = new Hono<AppEnv>()
  .use("*", requireAuth)
  .patch("/", updateProfile)
  .patch("/password", changePassword);
