import type { TenantBillingDto } from "@app/shared";
import { api } from "@/lib/api";

export const billingApi = {
  get: (tenantId: string) => api.get<TenantBillingDto>(`/tenants/${tenantId}/billing`),
};
