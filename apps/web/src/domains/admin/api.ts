import type { AdminTenantDto, AdminUserDto } from "@app/shared";
import { api } from "@/lib/api";

export const adminApi = {
  listUsers: () => api.get<AdminUserDto[]>("/admin/users"),
  updateUser: (userId: string, body: { isPlatformAdmin: boolean }) =>
    api.patch<AdminUserDto>(`/admin/users/${userId}`, body),
  listTenants: () => api.get<AdminTenantDto[]>("/admin/tenants"),
  updateTenant: (tenantId: string, body: { name: string }) =>
    api.patch<AdminTenantDto>(`/admin/tenants/${tenantId}`, body),
};
