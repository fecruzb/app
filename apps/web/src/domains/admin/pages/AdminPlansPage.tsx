import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@app/ui/empty-state";
import { PageHeader } from "@app/ui/page-header";
import { PageLoading } from "@app/ui/page-loading";
import { adminApi } from "../api";
import { PlanCard } from "../components/plan-card";

export function AdminPlansPage() {
  const { t } = useTranslation();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: adminApi.listPlans,
  });

  return (
    <div className="grid gap-6">
      <PageHeader title={t("admin.plans.title")} description={t("admin.plans.description")} />

      {isLoading ? (
        <PageLoading />
      ) : !plans?.length ? (
        <EmptyState>{t("admin.plans.empty")}</EmptyState>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{t("admin.plans.pspHint")}</p>
        </>
      )}
    </div>
  );
}
