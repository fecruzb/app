import { useTranslation } from "react-i18next";
import {
  CheckIcon,
  CreditCardIcon,
  Link2Icon,
  SparklesIcon,
  Trash2Icon,
  UsersIcon,
  WebhookIcon,
} from "lucide-react";
import { Window } from "@app/ui/browser-window";
import { cn } from "@app/ui/lib/utils";

/** Seat subscription vs included AI vs pay-as-you-go. */
export function BillingModelsMock() {
  const { t } = useTranslation();
  const models = [
    {
      id: "seats",
      icon: UsersIcon,
      title: t("landing.preview.billing.modelSeatsTitle"),
      body: t("landing.preview.billing.modelSeatsBody"),
      badge: t("landing.preview.billing.modelSeatsBadge"),
    },
    {
      id: "included",
      icon: SparklesIcon,
      title: t("landing.preview.billing.modelAiTitle"),
      body: t("landing.preview.billing.modelAiBody"),
      badge: t("landing.preview.billing.modelAiBadge"),
    },
    {
      id: "passthrough",
      icon: CreditCardIcon,
      title: t("landing.preview.billing.modelUsageTitle"),
      body: t("landing.preview.billing.modelUsageBody"),
      badge: t("landing.preview.billing.modelUsageBadge"),
    },
  ];
  return (
    <Window label={t("landing.preview.billing.modelsLabel")}>
      <div className="space-y-3 bg-card p-4 text-sm">
        <p className="text-xs text-muted-foreground">{t("landing.preview.billing.modelsHint")}</p>
        <div className="grid gap-2">
          {models.map((m) => (
            <div key={m.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <m.icon className="size-3.5 text-primary" />
                <p className="text-xs font-semibold">{m.title}</p>
                <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {m.badge}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{m.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}

/** Tenant Billing page — overview + member meters + disabled plan changer. */
export function TenantBillingMock() {
  const { t } = useTranslation();
  const members = [
    {
      name: t("landing.preview.sample.ada"),
      spent: "$1.20",
      pct: 24,
      you: true,
    },
    {
      name: t("landing.preview.sample.alan"),
      spent: "$3.40",
      pct: 68,
      you: false,
    },
  ];
  return (
    <Window label="/app/acme/billing">
      <div className="space-y-3 p-4 text-sm">
        <div className="rounded-lg border p-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{t("landing.preview.billing.overview")}</p>
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium">
              {t("landing.preview.plans.starterName")}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {t("landing.preview.billing.seatPrice")}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {t("landing.preview.billing.overviewHint")}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-[10px] text-muted-foreground">
                {t("landing.preview.billing.statSeats")}
              </p>
              <p className="text-sm font-semibold">{t("landing.preview.billing.seatsValue")}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">
                {t("landing.preview.billing.statAi")}
              </p>
              <p className="text-sm font-semibold">{t("landing.preview.billing.aiValue")}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">
                {t("landing.preview.billing.statResets")}
              </p>
              <p className="text-sm font-semibold">{t("landing.preview.billing.resetsValue")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border">
          <div className="border-b px-3 py-2">
            <p className="text-xs font-semibold">{t("landing.preview.billing.membersTitle")}</p>
          </div>
          <div className="divide-y">
            {members.map((m) => (
              <div key={m.name} className="space-y-1.5 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium">
                    {m.name}
                    {m.you ? (
                      <span className="text-muted-foreground">
                        {" "}
                        {t("landing.preview.invites.you")}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-muted-foreground">
                    {m.spent} / {t("landing.preview.billing.aiCap")}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full bg-primary", m.pct > 60 && "bg-primary")}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border p-3 opacity-70">
          <p className="text-xs font-semibold">{t("landing.preview.plans.changePlan")}</p>
          <div className="mt-2 flex h-9 items-center rounded-md border px-3 text-xs text-muted-foreground">
            {t("landing.preview.plans.starterName")}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            {t("landing.preview.billing.changePlanHint")}
          </p>
        </div>
      </div>
    </Window>
  );
}

/** Wire any PSP later — webhook / Checkout only need to set planId. */
export function BillingGatewayMock() {
  const { t } = useTranslation();
  const steps = [
    {
      icon: Link2Icon,
      title: t("landing.preview.billing.gatewayStepMap"),
      body: t("landing.preview.billing.gatewayStepMapBody"),
    },
    {
      icon: CreditCardIcon,
      title: t("landing.preview.billing.gatewayStepCheckout"),
      body: t("landing.preview.billing.gatewayStepCheckoutBody"),
    },
    {
      icon: WebhookIcon,
      title: t("landing.preview.billing.gatewayStepWebhook"),
      body: t("landing.preview.billing.gatewayStepWebhookBody"),
    },
  ];
  return (
    <Window label={t("landing.preview.billing.gatewayLabel")}>
      <div className="space-y-3 bg-card p-4 text-sm">
        <p className="text-xs font-semibold">{t("landing.preview.billing.gatewayTitle")}</p>
        <p className="text-[11px] text-muted-foreground">
          {t("landing.preview.billing.gatewayBody")}
        </p>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={step.title} className="flex gap-3 rounded-lg border p-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-semibold">
                  <step.icon className="size-3.5 text-muted-foreground" />
                  {step.title}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="rounded-md border border-primary/25 bg-primary/5 px-3 py-2 font-mono text-[10px] text-muted-foreground">
          {t("landing.preview.billing.gatewayFootnote")}
        </p>
      </div>
    </Window>
  );
}

/** Entitlements live in code — edit the catalog, tenants only store planId. */
export function BillingInCodeMock() {
  const { t } = useTranslation();
  const lines = t("landing.preview.billing.inCodeLines", { returnObjects: true });
  const list = Array.isArray(lines) ? (lines as string[]) : [];
  return (
    <Window label="domains/billing/constants/plans.constants.ts">
      <div className="space-y-3 bg-card p-4 text-sm">
        <p className="text-xs text-muted-foreground">{t("landing.preview.billing.inCodeHint")}</p>
        <div className="rounded-lg border bg-muted/30 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
          <p className="text-primary">PLAN_CATALOG</p>
          <p className="mt-1">tenants.plan_id → "starter"</p>
          <p>getPlan(id) · assertSeatAvailable · assertAiBudget</p>
        </div>
        <ul className="space-y-1.5">
          {list.map((item) => (
            <li key={item} className="flex gap-2 text-[11px] text-muted-foreground">
              <CheckIcon className="mt-0.5 size-3 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </Window>
  );
}

/** Customize prices / drop billing — your product, your call. */
export function BillingOptionalMock() {
  const { t } = useTranslation();
  const keep = t("landing.preview.billing.optionalKeep", { returnObjects: true });
  const drop = t("landing.preview.billing.optionalDrop", { returnObjects: true });
  const keepList = Array.isArray(keep) ? (keep as string[]) : [];
  const dropList = Array.isArray(drop) ? (drop as string[]) : [];
  return (
    <Window label={t("landing.preview.billing.optionalLabel")}>
      <div className="grid gap-3 bg-card p-4 text-sm sm:grid-cols-2">
        <div className="rounded-lg border p-3">
          <p className="text-xs font-semibold text-primary">
            {t("landing.preview.billing.optionalKeepTitle")}
          </p>
          <ul className="mt-2 space-y-1.5">
            {keepList.map((item) => (
              <li key={item} className="flex gap-2 text-xs text-muted-foreground">
                <CheckIcon className="mt-0.5 size-3 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs font-semibold">{t("landing.preview.billing.optionalDropTitle")}</p>
          <ul className="mt-2 space-y-1.5">
            {dropList.map((item) => (
              <li key={item} className="flex gap-2 text-xs text-muted-foreground">
                <Trash2Icon className="mt-0.5 size-3 shrink-0 opacity-60" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[11px] text-muted-foreground sm:col-span-2">
          {t("landing.preview.billing.optionalNote")}
        </p>
      </div>
    </Window>
  );
}
