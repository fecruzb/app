import type { AppConfig } from "@app/shared";
import { api } from "@/lib/api";

export const appApi = {
  config: () => api.get<AppConfig>("/config"),
};
