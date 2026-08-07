import type { z } from "zod";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  type AuthSessionDto,
  type MeDto,
  type OkDto,
} from "@app/shared";
import { api } from "@/lib/api";
import { clearSessionToken, setSessionToken } from "@/lib/session-token";

/** Persist shell bearer when present; return plain MeDto for the auth cache. */
function captureShellSession(session: AuthSessionDto): MeDto {
  if (session.sessionToken) setSessionToken(session.sessionToken);
  return { user: session.user, tenants: session.tenants };
}

export const authApi = {
  me: () => api.get<MeDto>("/auth/me"),
  login: async (body: z.infer<typeof loginSchema>) =>
    captureShellSession(await api.post<AuthSessionDto>("/auth/login", body)),
  register: async (body: z.infer<typeof registerSchema>) =>
    captureShellSession(await api.post<AuthSessionDto>("/auth/register", body)),
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearSessionToken();
    }
  },
  forgotPassword: (body: z.infer<typeof forgotPasswordSchema>) =>
    api.post<OkDto>("/auth/forgot-password", body),
  resetPassword: async (body: z.infer<typeof resetPasswordSchema>) =>
    captureShellSession(await api.post<AuthSessionDto>("/auth/reset-password", body)),
  verifyEmail: (body: z.infer<typeof verifyEmailSchema>) =>
    api.post<OkDto>("/auth/verify-email", body),
  resendVerification: () => api.post<OkDto>("/auth/resend-verification"),
};
