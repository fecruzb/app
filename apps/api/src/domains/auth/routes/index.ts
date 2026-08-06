/**
 * Auth routes
 *
 * Wires handlers into the Hono route group. Individual handlers live in
 * `*.route.ts` beside this file.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "../middleware";
import { forgotPassword } from "./forgot-password.route";
import { login } from "./login.route";
import { logout } from "./logout.route";
import { me } from "./me.route";
import { register } from "./register.route";
import { resendVerification } from "./resend-verification.route";
import { resetPassword } from "./reset-password.route";
import { verifyEmail } from "./verify-email.route";

/**
 * Auth route group
 *
 * Mounted at `/api/auth`. Session cookie is set on login/register.
 */
export const authRoutes = new Hono<AppEnv>()
  .post("/register", register)
  .post("/login", login)
  .post("/logout", logout)
  .get("/me", requireAuth, me)
  .post("/forgot-password", forgotPassword)
  .post("/reset-password", resetPassword)
  .post("/verify-email", verifyEmail)
  .post("/resend-verification", requireAuth, resendVerification);
