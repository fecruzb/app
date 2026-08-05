import { createContext, useContext, useEffect, type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import type { TenantSummaryDto } from "@app/shared";
import { managerRoles } from "@app/shared";
import { useAuth } from "@/domains/auth/auth-provider";

const LAST_TENANT_KEY = "app:lastTenant";

type TenantContextValue = {
  tenant: TenantSummaryDto;
  /** true for owner/admin — controls visibility of management actions. */
  isManager: boolean;
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function getLastTenantSlug(): string | null {
  return localStorage.getItem(LAST_TENANT_KEY);
}

/**
 * Resolves the `:tenantSlug` param against the logged-in user's tenants.
 * Unknown slug → back to /app.
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
  if (!ctx) throw new Error("useTenant must be used within <TenantProvider>");
  return ctx;
}
