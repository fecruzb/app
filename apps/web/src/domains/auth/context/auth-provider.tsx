import { createContext, useContext, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { MeDto } from "@app/shared";
import { ApiError } from "@/lib/api";
import { authApi } from "../api";

type AuthContextValue = {
  /** null = logged out; undefined never reaches consumers (gated in the provider). */
  me: MeDto | null;
  isLoading: boolean;
  /** Updates the cache after login/register/account changes. */
  setMe: (me: MeDto | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async (): Promise<MeDto | null> => {
      try {
        return await authApi.me();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  const setMe = (me: MeDto | null) => queryClient.setQueryData(["me"], me);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["me"] });
  };

  const logout = async () => {
    await authApi.logout();
    queryClient.clear();
    setMe(null);
  };

  return (
    <AuthContext.Provider value={{ me: data ?? null, isLoading, setMe, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
