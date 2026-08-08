import { useTranslation } from "react-i18next";
import {
  ArrowDownIcon,
  Building2Icon,
  CheckIcon,
  GlobeIcon,
  MegaphoneIcon,
  PlusIcon,
  ShieldIcon,
  ToggleLeftIcon,
} from "lucide-react";
import { Window } from "@app/ui/browser-window";
import { AdminShell } from "./admin-mocks";

/** Platform admin sits above every customer tenant — control plane, not a tenant bypass. */
export function AdminLayerMock() {
  const { t } = useTranslation();
  const tenants = [
    {
      name: t("landing.preview.sample.tenant"),
      meta: t("landing.preview.adminPlatform.fleetMetaA"),
    },
    {
      name: t("landing.preview.sample.adaWorkspace"),
      meta: t("landing.preview.adminPlatform.fleetMetaB"),
    },
    {
      name: t("landing.preview.adminPlatform.fleetTenantC"),
      meta: t("landing.preview.adminPlatform.fleetMetaC"),
    },
  ];
  return (
    <Window label={t("landing.preview.adminPlatform.layerLabel")}>
      <div className="space-y-3 bg-card p-4 text-sm">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
            <ShieldIcon className="size-3.5" />
            {t("landing.preview.adminPlatform.layerAdmin")}
          </p>
          <p className="mt-1.5 text-xs font-semibold">
            {t("landing.preview.adminPlatform.layerAdminTitle")}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {t("landing.preview.adminPlatform.layerAdminBody")}
          </p>
        </div>
        <div className="flex justify-center text-muted-foreground">
          <ArrowDownIcon className="size-4" />
        </div>
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Building2Icon className="size-3.5" />
            {t("landing.preview.adminPlatform.layerTenants")}
          </p>
          {tenants.map((tenant) => (
            <div key={tenant.name} className="rounded-md border bg-background px-3 py-2">
              <p className="text-xs font-medium">{tenant.name}</p>
              <p className="text-[10px] text-muted-foreground">{tenant.meta}</p>
            </div>
          ))}
        </div>
        <p className="rounded-md border border-primary/25 bg-primary/5 px-3 py-2 text-[11px] text-muted-foreground">
          {t("landing.preview.adminPlatform.layerFootnote")}
        </p>
      </div>
    </Window>
  );
}

/** Fleet of customer tenants — plan, seats, AI spend signals. */
export function AdminFleetMock() {
  const { t } = useTranslation();
  const rows = [
    {
      name: t("landing.preview.sample.tenant"),
      slug: "acme",
      plan: t("landing.preview.plans.starterName"),
      seats: "3 / 3",
      ai: "$12.40",
      mrr: "$15",
    },
    {
      name: t("landing.preview.sample.adaWorkspace"),
      slug: "ada",
      plan: t("landing.preview.plans.freeName"),
      seats: "1 / 1",
      ai: "$0.80",
      mrr: "$0",
    },
    {
      name: t("landing.preview.adminPlatform.fleetTenantC"),
      slug: "northwind",
      plan: t("landing.preview.plans.proName"),
      seats: "7 / 10",
      ai: "$28.10",
      mrr: "$50",
    },
  ];
  return (
    <Window label="/admin/tenants">
      <AdminShell active="tenants">
        <div className="mb-3">
          <p className="text-sm font-semibold">{t("landing.preview.adminPlatform.fleetTitle")}</p>
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.adminPlatform.fleetDescription")}
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[1.4fr_0.7fr_0.6fr_0.6fr_0.5fr] gap-1 border-b bg-muted/40 px-3 py-2 text-[10px] font-medium text-muted-foreground">
            <span>{t("landing.preview.adminPlatform.colTenant")}</span>
            <span>{t("landing.preview.adminPlatform.colPlan")}</span>
            <span>{t("landing.preview.adminPlatform.colSeats")}</span>
            <span>{t("landing.preview.adminPlatform.colAi")}</span>
            <span>{t("landing.preview.adminPlatform.colMrr")}</span>
          </div>
          {rows.map((row) => (
            <div
              key={row.slug}
              className="grid grid-cols-[1.4fr_0.7fr_0.6fr_0.6fr_0.5fr] items-center gap-1 border-b px-3 py-2.5 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{row.name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{row.slug}</p>
              </div>
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary w-fit">
                {row.plan}
              </span>
              <span className="text-[11px] text-muted-foreground">{row.seats}</span>
              <span className="text-[11px] text-muted-foreground">{row.ai}</span>
              <span className="text-[11px] font-medium">{row.mrr}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          {t("landing.preview.adminPlatform.fleetNote")}
        </p>
      </AdminShell>
    </Window>
  );
}

/**
 * Aspirational platform CMS — global content/config that fans out to every tenant.
 * Shows how /admin grows beyond today's people/invites/tenants/plans.
 */
export function AdminCmsMock() {
  const { t } = useTranslation();
  const items = [
    {
      icon: MegaphoneIcon,
      title: t("landing.preview.adminPlatform.cmsAnnounce"),
      body: t("landing.preview.adminPlatform.cmsAnnounceBody"),
    },
    {
      icon: ToggleLeftIcon,
      title: t("landing.preview.adminPlatform.cmsFlags"),
      body: t("landing.preview.adminPlatform.cmsFlagsBody"),
    },
    {
      icon: GlobeIcon,
      title: t("landing.preview.adminPlatform.cmsDefaults"),
      body: t("landing.preview.adminPlatform.cmsDefaultsBody"),
    },
  ];
  return (
    <Window label={t("landing.preview.adminPlatform.cmsLabel")}>
      <div className="space-y-3 bg-card p-4 text-sm">
        <div>
          <p className="text-sm font-semibold">{t("landing.preview.adminPlatform.cmsTitle")}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {t("landing.preview.adminPlatform.cmsBody")}
          </p>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.title} className="rounded-lg border p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold">
                <item.icon className="size-3.5 text-primary" />
                {item.title}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">{item.body}</p>
              <p className="mt-2 text-[10px] font-medium text-primary">
                {t("landing.preview.adminPlatform.cmsFansOut")}
              </p>
            </div>
          ))}
        </div>
        <p className="rounded-md border border-dashed px-3 py-2 text-[11px] text-muted-foreground">
          {t("landing.preview.adminPlatform.cmsFootnote")}
        </p>
      </div>
    </Window>
  );
}

/** How to grow /admin — same domain folder pattern as the rest of the app. */
export function AdminGrowMock() {
  const { t } = useTranslation();
  const steps = t("landing.preview.adminPlatform.growSteps", { returnObjects: true });
  const list = Array.isArray(steps) ? (steps as string[]) : [];
  return (
    <Window label={t("landing.preview.adminPlatform.growLabel")}>
      <div className="space-y-3 bg-card p-4 text-sm">
        <p className="text-xs text-muted-foreground">{t("landing.preview.adminPlatform.growHint")}</p>
        <div className="space-y-2">
          {list.map((step, i) => (
            <div key={step} className="flex gap-3 rounded-lg border p-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                {i === list.length - 1 ? <PlusIcon className="size-3" /> : i + 1}
              </span>
              <p className="text-[11px] text-muted-foreground">{step}</p>
            </div>
          ))}
        </div>
        <p className="flex items-start gap-2 rounded-md border border-primary/25 bg-primary/5 px-3 py-2 text-[11px] text-muted-foreground">
          <CheckIcon className="mt-0.5 size-3 shrink-0 text-primary" />
          {t("landing.preview.adminPlatform.growFootnote")}
        </p>
      </div>
    </Window>
  );
}
