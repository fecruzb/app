import type { AiUsageDto } from "@app/shared";
import { api } from "@/lib/api";

export const usageApi = {
  getAi: (tenantId: string) =>
    api.get<AiUsageDto>(`/usage/ai?tenantId=${encodeURIComponent(tenantId)}`),
};
