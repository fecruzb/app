// Conta do usuário logado (perfil e senha) — independe de tenant.
import { Hono } from "hono";
import type { AppEnv } from "../../lib/http";
import { requireAuth } from "../auth/middleware";
import { changePassword } from "./endpoints/change-password.endpoint";
import { updateProfile } from "./endpoints/update-profile.endpoint";

export const accountRoutes = new Hono<AppEnv>()
  .use("*", requireAuth)
  .patch("/", updateProfile)
  .patch("/password", changePassword);
