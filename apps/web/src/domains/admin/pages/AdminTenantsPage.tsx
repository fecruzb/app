import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@app/ui/empty-state";
import { PageHeader } from "@app/ui/page-header";
import { PageLoading } from "@app/ui/page-loading";
import { adminApi } from "../api";
import { TenantCard } from "../components/tenant-card";

export function AdminTenantsPage() {
  const { t } = useTranslation();

  const { data: tenants, isLoading } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: adminApi.listTenants,
  });

  return (
    <div className="grid gap-6">
      <PageHeader title={t("admin.tenants.title")} description={t("admin.tenants.description")} />

      {isLoading ? (
        <PageLoading />
      ) : !tenants?.length ? (
        <EmptyState>{t("admin.tenants.empty")}</EmptyState>
      ) : (
        <div className="grid gap-4">
          {tenants.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}
    </div>
  );
}
