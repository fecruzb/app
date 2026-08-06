import type {
  AdminPlatformInviteDto,
  AdminTenantDto,
  AdminUserDto,
  MeDto,
  PublicPlatformInviteDto,
} from "@app/shared";
import { api } from "@/lib/api";

export const adminApi = {
  listUsers: () => api.get<AdminUserDto[]>("/admin/users"),
  updateUser: (userId: string, body: { isPlatformAdmin: boolean }) =>
    api.patch<AdminUserDto>(`/admin/users/${userId}`, body),
  listTenants: () => api.get<AdminTenantDto[]>("/admin/tenants"),
  updateTenant: (tenantId: string, body: { name?: string; slug?: string }) =>
    api.patch<AdminTenantDto>(`/admin/tenants/${tenantId}`, body),
  listInvites: () => api.get<AdminPlatformInviteDto[]>("/admin/invites"),
  createInvite: (body: { email: string }) =>
    api.post<AdminPlatformInviteDto>("/admin/invites", body),
  revokeInvite: (inviteId: string) => api.delete(`/admin/invites/${inviteId}`),
  getJoinInvite: (token: string) => api.get<PublicPlatformInviteDto>(`/join/${token}`),
  acceptJoinInvite: (token: string, body: { name: string; password: string }) =>
    api.post<MeDto>(`/join/${token}/accept`, body),
};
