// Auth domain route map — each handler lives in endpoints/*.
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { forgotPassword } from "./endpoints/forgot-password.endpoint";
import { login } from "./endpoints/login.endpoint";
import { logout } from "./endpoints/logout.endpoint";
import { me } from "./endpoints/me.endpoint";
import { register } from "./endpoints/register.endpoint";
import { resendVerification } from "./endpoints/resend-verification.endpoint";
import { resetPassword } from "./endpoints/reset-password.endpoint";
import { verifyEmail } from "./endpoints/verify-email.endpoint";
import { requireAuth } from "./middleware";

export const authRoutes = new Hono<AppEnv>()
  .post("/register", register)
  .post("/login", login)
  .post("/logout", logout)
  .get("/me", requireAuth, me)
  .post("/forgot-password", forgotPassword)
  .post("/reset-password", resetPassword)
  .post("/verify-email", verifyEmail)
  .post("/resend-verification", requireAuth, resendVerification);
