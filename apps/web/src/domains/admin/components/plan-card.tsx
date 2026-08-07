import { useTranslation } from "react-i18next";
import type { PlanDto } from "@app/shared";
import { Badge } from "@app/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui/card";
import { dateLocale } from "@/i18n";
import { formatUsdMicros } from "@/lib/utils";

export function PlanCard({ plan }: { plan: PlanDto }) {
  const { t, i18n } = useTranslation();
  const money = (micros: number) =>
    formatUsdMicros(micros, dateLocale(i18n.language), {
      fractionDigits: 0,
      lessThanCent: t("common.lessThanCent"),
    });

  const seats =
    plan.maxSeats === null
      ? t("admin.plans.seatsUnlimited")
      : t("admin.plans.seats", { count: plan.maxSeats });

  const ai =
    plan.aiBilling === "passthrough"
      ? t("admin.plans.aiPassthrough")
      : t("admin.plans.aiIncluded", { amount: money(plan.aiPerSeatMicros) });

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
            ? t("admin.plans.seatPrice", { price: money(plan.pricePerSeatMicros) })
            : t("admin.plans.seatFree")}
        </p>
        <p>{ai}</p>
      </CardContent>
    </Card>
  );
}
