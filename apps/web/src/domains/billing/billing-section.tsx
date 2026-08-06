import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { planIds, type PlanId, type TenantBillingDto } from "@app/shared";
import { Badge } from "@app/ui/badge";
import { Button } from "@app/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui/card";
import { Label } from "@app/ui/label";
import { PageLoading } from "@app/ui/page-loading";
import { cn } from "@app/ui/lib/utils";
import { dateLocale } from "@/i18n";
import { useAuth } from "@/domains/auth/auth-provider";
import { useTenant } from "@/domains/tenant/tenant-provider";
import { billingApi } from "./api";

const selectClass =
  "h-9 w-full max-w-sm rounded-md border border-input bg-transparent px-2 text-sm opacity-60";

/** Amounts travel as micro-dollars (USD * 1_000_000). */
function formatUsd(micros: number): string {
  if (micros > 0 && micros < 10_000) return "<$0.01";
  return `$${(micros / 1_000_000).toFixed(2)}`;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="grid gap-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tracking-tight">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function PlanOverview({ billing }: { billing: TenantBillingDto }) {
  const { t, i18n } = useTranslation();

  const seatsValue =
    billing.maxSeats === null
      ? t("billing.seatsUnlimited", { used: billing.seatsUsed })
      : t("billing.seatsUsed", { used: billing.seatsUsed, max: billing.maxSeats });

  const periodEnd = new Date(billing.periodEnd).toLocaleDateString(dateLocale(i18n.language), {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  const aiValue =
    billing.aiBilling === "passthrough"
      ? formatUsd(billing.tenantSpentMicros)
      : `${formatUsd(billing.tenantSpentMicros)} / ${
          billing.aiTenantCeilingMicros !== null
            ? formatUsd(billing.aiTenantCeilingMicros)
            : t("billing.noCap")
        }`;

  const aiHint =
    billing.aiBilling === "passthrough"
      ? t("billing.aiPassthrough")
      : t("billing.aiIncluded", { amount: formatUsd(billing.aiPerSeatMicros) });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">{t("billing.overviewTitle")}</CardTitle>
          <Badge variant="secondary">{t(`plans.${billing.planId}.name`)}</Badge>
          {billing.pricePerSeatMicros > 0 && (
            <span className="text-xs text-muted-foreground">
              {t("billing.seatPrice", { price: formatUsd(billing.pricePerSeatMicros) })}
            </span>
          )}
        </div>
        <CardDescription>{t(`plans.${billing.planId}.summary`)}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-3">
        <Stat
          label={t("billing.statSeats")}
          value={seatsValue}
          hint={t("billing.seatsDetail", {
            members: billing.memberCount,
            invites: billing.pendingInviteCount,
          })}
        />
        <Stat label={t("billing.statAi")} value={aiValue} hint={aiHint} />
        <Stat label={t("billing.statResets")} value={periodEnd} hint={t("billing.resetsHint")} />
      </CardContent>
    </Card>
  );
}

function MemberUsage({ billing }: { billing: TenantBillingDto }) {
  const { t } = useTranslation();
  const { me } = useAuth();

  const limitLabel =
    billing.aiPerSeatMicros > 0 ? formatUsd(billing.aiPerSeatMicros) : t("billing.noCap");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("billing.membersTitle")}</CardTitle>
        <CardDescription>{t("billing.membersDescription", { limit: limitLabel })}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y border-t">
          {billing.members.map((member) => {
            const isYou = member.userId === me?.user.id;
            const percent =
              billing.aiPerSeatMicros > 0
                ? Math.min(100, (member.spentMicros / billing.aiPerSeatMicros) * 100)
                : 0;
            return (
              <div key={member.userId} className="grid gap-2 px-6 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {member.name}
                      {isYou && <span className="text-muted-foreground"> {t("billing.you")}</span>}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {member.email} · {t(`roles.${member.role}`)}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p className={cn("font-medium", member.overLimit && "text-destructive")}>
                      {formatUsd(member.spentMicros)}
                      {billing.aiPerSeatMicros > 0 && (
                        <span className="text-muted-foreground">
                          {" "}
                          {t("billing.of", { limit: formatUsd(billing.aiPerSeatMicros) })}
                        </span>
                      )}
                    </p>
                    <p className="text-muted-foreground">
                      {t("billing.request", { count: member.requestCount })}
                    </p>
                  </div>
                </div>
                {billing.aiPerSeatMicros > 0 && (
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        member.overLimit ? "bg-destructive" : "bg-primary",
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ChangePlan({ planId }: { planId: PlanId }) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("billing.changePlan")}</CardTitle>
        <CardDescription>{t("billing.changePlanHint")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-2">
          <Label htmlFor="billing-plan">{t("billing.planLabel")}</Label>
          <div className="flex flex-wrap items-center gap-2">
            <select id="billing-plan" className={selectClass} value={planId} disabled aria-disabled>
              {planIds.map((id) => (
                <option key={id} value={id}>
                  {t(`plans.${id}.name`)} — {t(`plans.${id}.summary`)}
                </option>
              ))}
            </select>
            <Button type="button" size="sm" disabled>
              {t("billing.changePlanCta")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Workspace plan overview, per-member AI usage, and a disabled plan changer.
 */
export function BillingSection() {
  const { tenant } = useTenant();

  const { data: billing, isLoading } = useQuery({
    queryKey: ["billing", tenant.id],
    queryFn: () => billingApi.get(tenant.id),
  });

  if (isLoading) return <PageLoading />;
  if (!billing) return null;

  return (
    <div id="billing" className="grid gap-6">
      <PlanOverview billing={billing} />
      <MemberUsage billing={billing} />
      <ChangePlan planId={billing.planId} />
    </div>
  );
}
