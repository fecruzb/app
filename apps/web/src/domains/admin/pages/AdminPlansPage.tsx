import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { PlanDto } from "@app/shared";
import { Badge } from "@app/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui/card";
import { PageHeader } from "@app/ui/page-header";
import { PageLoading } from "@app/ui/page-loading";
import { adminApi } from "../api";

/** Amounts travel as micro-dollars (USD * 1_000_000). */
function formatUsd(micros: number): string {
  if (micros === 0) return "$0";
  if (micros > 0 && micros < 10_000) return "<$0.01";
  return `$${(micros / 1_000_000).toFixed(0)}`;
}

function PlanCard({ plan }: { plan: PlanDto }) {
  const { t } = useTranslation();

  const seats =
    plan.maxSeats === null
      ? t("admin.plans.seatsUnlimited")
      : t("admin.plans.seats", { count: plan.maxSeats });

  const ai =
    plan.aiBilling === "passthrough"
      ? t("admin.plans.aiPassthrough")
      : t("admin.plans.aiIncluded", { amount: formatUsd(plan.aiPerSeatMicros) });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">{t(`plans.${plan.id}.name`)}</CardTitle>
          <Badge variant="outline" className="font-mono text-[10px]">
            {plan.id}
          </Badge>
        </div>
        <CardDescription>{t(`plans.${plan.id}.summary`)}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-1 text-sm text-muted-foreground">
        <p>{seats}</p>
        <p>
          {plan.pricePerSeatMicros > 0
            ? t("admin.plans.seatPrice", { price: formatUsd(plan.pricePerSeatMicros) })
            : t("admin.plans.seatFree")}
        </p>
        <p>{ai}</p>
      </CardContent>
    </Card>
  );
}

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
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {plans?.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{t("admin.plans.pspHint")}</p>
        </>
      )}
    </div>
  );
}
