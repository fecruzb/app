import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";

type AppConfig = {
  selfSignupEnabled: boolean;
  aiEnabled: boolean;
};

export function useAppConfig() {
  const { data } = useQuery({
    queryKey: ["config"],
    queryFn: () => api.get<AppConfig>("/config"),
    staleTime: Infinity,
  });
  return data ?? { selfSignupEnabled: true, aiEnabled: false };
}
