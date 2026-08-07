import { z } from "zod";
import type { TenantSummaryDto } from "./tenant";

// -- schemas (validated in the API and reused in web forms) -------------------

/** Display name for signup / profile (also reused by invite accept flows). */
export const userNameSchema = z.string().trim().min(2).max(100);

/** Password for signup, reset, and change (login only requires non-empty). */
export const passwordSchema = z.string().min(8).max(200);

export const registerSchema = z.object({
  name: userNameSchema,
  email: z.email().toLowerCase(),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

// -- DTOs ----------------------------------------------------------------------

export type UserDto = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  isPlatformAdmin: boolean;
  createdAt: string;
};

export type MeDto = {
  user: UserDto;
  tenants: TenantSummaryDto[];
};

/**
 * Login/register payload for cross-origin shells (Tauri). Includes the raw
 * session token once so the client can send `Authorization: Bearer` — WKWebView
 * does not persist `SameSite=None; Secure` cookies against an HTTP API.
 * Browser same-origin deploys omit `sessionToken` and keep the httpOnly cookie.
 */
export type AuthSessionDto = MeDto & {
  sessionToken?: string;
};
