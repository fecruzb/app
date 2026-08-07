import { useQuery } from "@tanstack/react-query";
import { appApi } from "./api";

export function useAppConfig() {
  const { data } = useQuery({
    queryKey: ["config"],
    queryFn: () => appApi.config(),
    staleTime: Infinity,
  });
  return data ?? { selfSignupEnabled: true, aiEnabled: false };
}
