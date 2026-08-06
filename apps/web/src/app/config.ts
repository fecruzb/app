import { useQuery } from "@tanstack/react-query";
import type { AppConfig } from "@app/shared";
import { api } from "@/lib/api";

export function useAppConfig() {
  const { data } = useQuery({
    queryKey: ["config"],
    queryFn: () => api.get<AppConfig>("/config"),
    staleTime: Infinity,
  });
  return data ?? { selfSignupEnabled: true, aiEnabled: false };
}
