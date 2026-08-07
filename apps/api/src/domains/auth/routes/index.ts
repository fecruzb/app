/**
 * Auth routes
 *
 * Wires handlers into the Hono route group. Individual handlers live in
 * `*.route.ts` beside this file.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "../middleware";
import { forgotPassword } from "./forgot-password.post.route";
import { login } from "./login.post.route";
import { logout } from "./logout.post.route";
import { me } from "./me.get.route";
import { register } from "./register.post.route";
import { resendVerification } from "./resend-verification.post.route";
import { resetPassword } from "./reset-password.post.route";
import { verifyEmail } from "./verify-email.post.route";

/**
 * Auth route group
 *
 * Mounted at `/api/auth`.
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
