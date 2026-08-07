import { z } from "zod";

// -- schemas (validated in the API and reused in web forms) -------------------

export const updateAccountSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

export const createApiKeySchema = z.object({
  name: z.string().trim().min(1).max(100),
  tenantId: z.string().uuid(),
  /** Optional lifetime in days; omit or null for a key that never expires. */
  expiresInDays: z.number().int().min(1).max(365).nullish(),
});

// -- DTOs ----------------------------------------------------------------------

export type ApiKeyDto = {
  id: string;
  name: string;
  prefix: string;
  tenantId: string;
  tenantName: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

/** Returned only on creation — includes the full key, shown once. */
export type CreatedApiKeyDto = ApiKeyDto & {
  key: string;
};
