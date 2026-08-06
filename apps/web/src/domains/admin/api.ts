import type { z } from "zod";
import {
  acceptPlatformInviteSchema,
  createPlatformInviteSchema,
  updateAdminTenantSchema,
  updateAdminUserSchema,
  type AdminPlatformInviteDto,
  type AdminTenantDto,
  type AdminUserDto,
  type MeDto,
  type PlanDto,
  type PublicPlatformInviteDto,
} from "@app/shared";
import { api } from "@/lib/api";

export const adminApi = {
  listUsers: () => api.get<AdminUserDto[]>("/admin/users"),
  updateUser: (userId: string, body: z.infer<typeof updateAdminUserSchema>) =>
    api.patch<AdminUserDto>(`/admin/users/${userId}`, body),
  listTenants: () => api.get<AdminTenantDto[]>("/admin/tenants"),
  updateTenant: (tenantId: string, body: z.infer<typeof updateAdminTenantSchema>) =>
    api.patch<AdminTenantDto>(`/admin/tenants/${tenantId}`, body),
  listPlans: () => api.get<PlanDto[]>("/admin/plans"),
  listInvites: () => api.get<AdminPlatformInviteDto[]>("/admin/invites"),
  createInvite: (body: z.infer<typeof createPlatformInviteSchema>) =>
    api.post<AdminPlatformInviteDto>("/admin/invites", body),
  revokeInvite: (inviteId: string) => api.delete(`/admin/invites/${inviteId}`),
  getJoinInvite: (token: string) => api.get<PublicPlatformInviteDto>(`/join/${token}`),
  acceptJoinInvite: (token: string, body: z.infer<typeof acceptPlatformInviteSchema>) =>
    api.post<MeDto>(`/join/${token}/accept`, body),
};
