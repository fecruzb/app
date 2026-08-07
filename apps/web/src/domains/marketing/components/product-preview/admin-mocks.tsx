import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { BoxIcon, MailIcon } from "lucide-react";

export function AdminShell({
  active,
  children,
}: {
  active: "people" | "invites" | "tenants" | "plans";
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const nav = [
    { id: "people" as const, label: t("landing.preview.admin.navPeople") },
    { id: "invites" as const, label: t("landing.preview.admin.navInvites") },
    { id: "tenants" as const, label: t("landing.preview.admin.navTenants") },
    { id: "plans" as const, label: t("landing.preview.admin.navPlans") },
  ];
  return (
    <div className="relative flex min-h-72 text-sm">
      <aside className="flex w-36 flex-col gap-3 border-r p-3">
        <div className="px-2">
          <p className="flex items-center gap-2 font-semibold">
            <BoxIcon className="size-4 text-primary" />
            {t("landing.preview.admin.brand")}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {t("landing.preview.admin.subtitle")}
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <div
              key={item.id}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                item.id === active ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </div>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1 p-4">{children}</div>
    </div>
  );
}

export function AdminPeopleBody() {
  const { t } = useTranslation();
  const people = [
    {
      name: t("landing.preview.sample.ada"),
      email: t("landing.preview.sample.adaEmail"),
      admin: true,
      self: true,
    },
    {
      name: t("landing.preview.sample.alan"),
      email: t("landing.preview.sample.alanEmail"),
      admin: false,
      self: false,
    },
  ];
  return (
    <AdminShell active="people">
      <div className="mb-3">
        <p className="text-sm font-semibold">{t("landing.preview.admin.peopleTitle")}</p>
        <p className="text-xs text-muted-foreground">
          {t("landing.preview.admin.peopleDescription")}
        </p>
      </div>
      <div className="divide-y rounded-lg border">
        {people.map((p) => (
          <div key={p.email} className="flex flex-wrap items-center gap-2 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {p.name}
                {p.self && (
                  <span className="text-muted-foreground"> {t("landing.preview.invites.you")}</span>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">{p.email}</p>
            </div>
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {t("landing.preview.admin.verified")}
            </span>
            {p.admin && (
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                {t("landing.preview.admin.platformAdmin")}
              </span>
            )}
            <div className="rounded-md border px-2 py-1 text-[10px] text-muted-foreground">
              {p.admin
                ? t("landing.preview.admin.removeAdmin")
                : t("landing.preview.admin.makeAdmin")}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

export function AdminInvitesBody() {
  const { t } = useTranslation();
  return (
    <AdminShell active="invites">
      <div className="mb-3">
        <p className="text-sm font-semibold">{t("landing.preview.admin.invitesTitle")}</p>
        <p className="text-xs text-muted-foreground">
          {t("landing.preview.admin.invitesDescription")}
        </p>
      </div>
      <div className="space-y-3">
        <div className="rounded-lg border p-3">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <p className="mb-1 text-xs font-medium">{t("landing.preview.email")}</p>
              <div className="flex h-9 items-center rounded-md border px-3 text-sm text-muted-foreground">
                {t("landing.preview.sample.samEmail")}
              </div>
            </div>
            <div className="flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
              {t("landing.preview.admin.sendInvite")}
            </div>
          </div>
        </div>
        <div className="rounded-lg border">
          <div className="border-b px-3 py-2">
            <p className="text-xs font-semibold">{t("landing.preview.admin.pending")}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 text-sm">
            <MailIcon className="size-3.5 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{t("landing.preview.sample.samEmail")}</span>
            <span className="text-[10px] text-muted-foreground">
              {t("landing.preview.admin.expires")}
            </span>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

export function AdminPlansBody() {
  const { t } = useTranslation();
  const plans = [
    {
      id: "free",
      name: t("landing.preview.plans.freeName"),
      detail: t("landing.preview.plans.freeDetail"),
    },
    {
      id: "starter",
      name: t("landing.preview.plans.starterName"),
      detail: t("landing.preview.plans.starterDetail"),
    },
    {
      id: "pro",
      name: t("landing.preview.plans.proName"),
      detail: t("landing.preview.plans.proDetail"),
    },
    {
      id: "usage",
      name: t("landing.preview.plans.usageName"),
      detail: t("landing.preview.plans.usageDetail"),
    },
  ];
  return (
    <AdminShell active="plans">
      <div className="mb-3">
        <p className="text-sm font-semibold">{t("landing.preview.plans.title")}</p>
        <p className="text-xs text-muted-foreground">{t("landing.preview.plans.description")}</p>
      </div>
      <div className="grid gap-2">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-lg border px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">{plan.name}</p>
              <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {plan.id}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{plan.detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground">{t("landing.preview.plans.pspHint")}</p>
    </AdminShell>
  );
}

export function AdminTenantsPlanBody() {
  const { t } = useTranslation();
  const tenants = [
    {
      name: t("landing.preview.sample.tenant"),
      slug: "acme",
      plan: t("landing.preview.plans.starterName"),
      members: [
        {
          name: t("landing.preview.sample.ada"),
          email: t("landing.preview.sample.adaEmail"),
          role: t("landing.preview.roles.owner"),
        },
        {
          name: t("landing.preview.sample.grace"),
          email: t("landing.preview.sample.graceEmail"),
          role: t("landing.preview.roles.admin"),
        },
        {
          name: t("landing.preview.sample.alan"),
          email: t("landing.preview.sample.alanEmail"),
          role: t("landing.preview.roles.member"),
        },
      ],
    },
    {
      name: t("landing.preview.sample.adaWorkspace"),
      slug: "ada",
      plan: t("landing.preview.plans.freeName"),
      members: [
        {
          name: t("landing.preview.sample.ada"),
          email: t("landing.preview.sample.adaEmailAlt"),
          role: t("landing.preview.roles.owner"),
        },
      ],
    },
  ];

  return (
    <AdminShell active="tenants">
      <div className="mb-3">
        <p className="text-sm font-semibold">{t("landing.preview.admin.tenantsTitle")}</p>
        <p className="text-xs text-muted-foreground">
          {t("landing.preview.admin.tenantsDescription")}
        </p>
      </div>
      <div className="grid gap-3">
        {tenants.map((tenant) => (
          <div key={tenant.slug} className="rounded-lg border">
            <div className="flex flex-wrap items-start justify-between gap-2 border-b px-3 py-2.5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium">{tenant.name}</p>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                    {tenant.plan}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  {tenant.slug} · {tenant.members.length}{" "}
                  {tenant.members.length === 1
                    ? t("landing.preview.admin.memberOne")
                    : t("landing.preview.admin.memberOther")}
                </p>
              </div>
              <div className="rounded-md border px-2 py-1 text-[10px] text-muted-foreground">
                {t("landing.preview.admin.edit")}
              </div>
            </div>
            <ul className="divide-y">
              {tenant.members.map((member) => (
                <li key={member.email} className="flex items-center gap-2 px-3 py-2">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-medium text-primary">
                    {member.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{member.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{member.email}</p>
                  </div>
                  <span className="shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {member.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
