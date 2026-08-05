import { z } from "zod";
import type { TenantSummaryDto } from "./tenant";

// -- schemas (validated in the API and reused in web forms) -------------------

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(200),
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
  password: z.string().min(8).max(200),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const updateAccountSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

// -- DTOs ----------------------------------------------------------------------

export type UserDto = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
};

export type MeDto = {
  user: UserDto;
  tenants: TenantSummaryDto[];
};
