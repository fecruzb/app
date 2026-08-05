import { createContext, useContext, useEffect, type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import type { TenantSummaryDto } from "@app/shared";
import { managerRoles } from "@app/shared";
import { useAuth } from "./auth";

const LAST_TENANT_KEY = "app:lastTenant";

type TenantContextValue = {
  tenant: TenantSummaryDto;
  /** true para owner/admin — controla exibição de ações de gestão. */
  isManager: boolean;
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function getLastTenantSlug(): string | null {
  return localStorage.getItem(LAST_TENANT_KEY);
}

/**
 * Resolve o tenant do param `:tenantSlug` contra a lista de tenants do
 * usuário logado. Slug desconhecido → volta para /app.
 */
export function TenantProvider({ children }: { children: ReactNode }) {
  const { me } = useAuth();
  const { tenantSlug } = useParams();

  const tenant = me?.tenants.find((t) => t.slug === tenantSlug) ?? null;

  useEffect(() => {
    if (tenant) localStorage.setItem(LAST_TENANT_KEY, tenant.slug);
  }, [tenant]);

  if (!tenant) return <Navigate to="/app" replace />;

  return (
    <TenantContext.Provider value={{ tenant, isManager: managerRoles.includes(tenant.role) }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant precisa estar dentro de <TenantProvider>");
  return ctx;
}
