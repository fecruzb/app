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
});

// -- DTOs ----------------------------------------------------------------------

export type ApiKeyDto = {
  id: string;
  name: string;
  prefix: string;
  tenantId: string;
  tenantName: string;
  lastUsedAt: string | null;
  createdAt: string;
};

/** Returned only on creation — includes the full key, shown once. */
export type CreatedApiKeyDto = ApiKeyDto & {
  key: string;
};
