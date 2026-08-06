import type { AiUsageDto } from "@app/shared";
import { api } from "@/lib/api";

export const usageApi = {
  getAi: () => api.get<AiUsageDto>("/usage/ai"),
};
