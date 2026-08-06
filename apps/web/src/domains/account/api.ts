import type { ApiKeyDto, CreatedApiKeyDto, UserDto } from "@app/shared";
import { api } from "@/lib/api";

export const accountApi = {
  updateProfile: (body: { name: string }) => api.patch<UserDto>("/account", body),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    api.patch("/account/password", body),
  listApiKeys: () => api.get<ApiKeyDto[]>("/account/api-keys"),
  createApiKey: (body: { name: string; tenantId: string }) =>
    api.post<CreatedApiKeyDto>("/account/api-keys", body),
  revokeApiKey: (id: string) => api.delete(`/account/api-keys/${id}`),
};
