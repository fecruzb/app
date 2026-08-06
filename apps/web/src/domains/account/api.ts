import type { z } from "zod";
import {
  changePasswordSchema,
  createApiKeySchema,
  updateAccountSchema,
  type ApiKeyDto,
  type CreatedApiKeyDto,
  type UserDto,
} from "@app/shared";
import { api } from "@/lib/api";

export const accountApi = {
  updateProfile: (body: z.infer<typeof updateAccountSchema>) =>
    api.patch<UserDto>("/account", body),
  changePassword: (body: z.infer<typeof changePasswordSchema>) =>
    api.patch("/account/password", body),
  listApiKeys: () => api.get<ApiKeyDto[]>("/account/api-keys"),
  createApiKey: (body: z.infer<typeof createApiKeySchema>) =>
    api.post<CreatedApiKeyDto>("/account/api-keys", body),
  revokeApiKey: (id: string) => api.delete(`/account/api-keys/${id}`),
};
