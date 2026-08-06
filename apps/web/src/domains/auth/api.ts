import type { z } from "zod";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  type MeDto,
} from "@app/shared";
import { api } from "@/lib/api";

export const authApi = {
  me: () => api.get<MeDto>("/auth/me"),
  login: (body: z.infer<typeof loginSchema>) => api.post<MeDto>("/auth/login", body),
  register: (body: z.infer<typeof registerSchema>) => api.post<MeDto>("/auth/register", body),
  logout: () => api.post("/auth/logout"),
  forgotPassword: (body: z.infer<typeof forgotPasswordSchema>) =>
    api.post("/auth/forgot-password", body),
  resetPassword: (body: z.infer<typeof resetPasswordSchema>) =>
    api.post<MeDto>("/auth/reset-password", body),
  verifyEmail: (body: z.infer<typeof verifyEmailSchema>) =>
    api.post<{ ok: boolean }>("/auth/verify-email", body),
  resendVerification: () => api.post("/auth/resend-verification"),
};
