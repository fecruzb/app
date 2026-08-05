import type { UserDto } from "@app/shared";
import { api } from "@/lib/api";

export const accountApi = {
  updateProfile: (body: { name: string }) => api.patch<UserDto>("/account", body),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    api.patch("/account/password", body),
};
