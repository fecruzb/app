import type { MeDto } from "@app/shared";
import { api } from "@/lib/api";

export const authApi = {
  me: () => api.get<MeDto>("/auth/me"),
  login: (body: { email: string; password: string }) => api.post<MeDto>("/auth/login", body),
  register: (body: { name: string; email: string; password: string }) =>
    api.post<MeDto>("/auth/register", body),
  logout: () => api.post("/auth/logout"),
  forgotPassword: (body: { email: string }) => api.post("/auth/forgot-password", body),
  resetPassword: (body: { token?: string; password: string }) =>
    api.post<MeDto>("/auth/reset-password", body),
  verifyEmail: (body: { token?: string }) => api.post<{ ok: boolean }>("/auth/verify-email", body),
  resendVerification: () => api.post("/auth/resend-verification"),
};
