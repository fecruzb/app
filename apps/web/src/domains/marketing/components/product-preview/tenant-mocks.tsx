import { useTranslation } from "react-i18next";
import {
  ArrowRightIcon,
  Building2Icon,
  CheckIcon,
  ChevronsUpDownIcon,
  Trash2Icon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { Window } from "@app/ui/browser-window";
import { cn } from "@app/ui/lib/utils";

/**
 * Singular app → multi-tenant platform — same codebase, N isolated customers.
 * Blog is the running example; other verticals are listed as chips.
 */
export function TenantIsolationMock() {
  const { t } = useTranslation();
  const examples = t("landing.preview.tenants.examples", { returnObjects: true });
  const exampleList = Array.isArray(examples) ? (examples as string[]) : [];
  const blogs = [
    {
      name: t("landing.preview.tenants.blogAcme"),
      owner: t("landing.preview.sample.tenant"),
    },
    {
      name: t("landing.preview.tenants.blogAda"),
      owner: t("landing.preview.sample.adaWorkspace"),
    },
    {
      name: t("landing.preview.tenants.blogAlan"),
      owner: t("landing.preview.sample.alan"),
    },
  ];

  return (
    <Window label={t("landing.preview.tenants.isolationLabel")}>
      <div className="space-y-4 bg-card p-4 text-sm">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div className="rounded-lg border p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <UserIcon className="size-3.5" />
              {t("landing.preview.tenants.singularLabel")}
            </p>
            <p className="mt-2 text-xs font-semibold">
              {t("landing.preview.tenants.singularTitle")}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t("landing.preview.tenants.singularBody")}
            </p>
          </div>
          <div className="hidden flex-col items-center gap-1 text-muted-foreground sm:flex">
            <ArrowRightIcon className="size-4" />
            <span className="max-w-[4.5rem] text-center text-[9px] leading-tight">
              {t("landing.preview.tenants.plusTenants")}
            </span>
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
              <Building2Icon className="size-3.5" />
              {t("landing.preview.tenants.platformLabel")}
            </p>
            <p className="mt-2 text-xs font-semibold">
              {t("landing.preview.tenants.platformTitle")}
            </p>
            <div className="mt-2 space-y-1.5">
              {blogs.map((blog) => (
                <div key={blog.name} className="rounded-md border bg-background px-2.5 py-1.5">
                  <p className="text-[11px] font-medium">{blog.name}</p>
                  <p className="text-[10px] text-muted-foreground">{blog.owner}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
            {t("landing.preview.tenants.examplesLabel")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {exampleList.map((ex) => (
              <span
                key={ex}
                className="rounded-md border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {ex}
              </span>
            ))}
          </div>
        </div>
        <p className="rounded-md border border-primary/25 bg-primary/5 px-3 py-2 text-[11px] text-muted-foreground">
          {t("landing.preview.tenants.isolationFootnote")}
        </p>
      </div>
    </Window>
  );
}

/** Template note: multi-tenant is the default, not a hard requirement. */
export function TenantOptionalMock() {
  const { t } = useTranslation();
  const keep = t("landing.preview.tenants.optionalKeep", { returnObjects: true });
  const drop = t("landing.preview.tenants.optionalDrop", { returnObjects: true });
  const keepList = Array.isArray(keep) ? (keep as string[]) : [];
  const dropList = Array.isArray(drop) ? (drop as string[]) : [];

  return (
    <Window label={t("landing.preview.tenants.optionalLabel")}>
      <div className="grid gap-3 bg-card p-4 text-sm sm:grid-cols-2">
        <div className="rounded-lg border p-3">
          <p className="text-xs font-semibold text-primary">
            {t("landing.preview.tenants.optionalKeepTitle")}
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
          <p className="text-xs font-semibold">{t("landing.preview.tenants.optionalDropTitle")}</p>
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
          {t("landing.preview.tenants.optionalNote")}
        </p>
      </div>
    </Window>
  );
}

/** Settings → General — rename the workspace. */
export function TenantGeneralMock() {
  const { t } = useTranslation();
  return (
    <Window label="/app/acme/settings">
      <div className="space-y-4 p-5 text-sm">
        <div>
          <p className="text-base font-semibold">{t("landing.preview.tenants.settingsTitle")}</p>
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.tenants.settingsDescription")}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="mb-3 text-xs font-semibold">{t("landing.preview.tenants.general")}</p>
          <p className="mb-1 text-xs font-medium">{t("landing.preview.name")}</p>
          <div className="flex h-9 items-center rounded-md border px-3 text-sm">
            {t("landing.preview.sample.tenant")}
          </div>
          <div className="mt-3 flex justify-end">
            <div className="flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">
              {t("landing.preview.account.save")}
            </div>
          </div>
        </div>
      </div>
    </Window>
  );
}

/** Members list with roles — Settings → Members. */
export function TenantMembersMock() {
  const { t } = useTranslation();
  const members = [
    {
      name: t("landing.preview.sample.ada"),
      email: t("landing.preview.sample.adaEmail"),
      role: t("landing.preview.roles.owner"),
      self: true,
    },
    {
      name: t("landing.preview.sample.alan"),
      email: t("landing.preview.sample.alanEmail"),
      role: t("landing.preview.roles.admin"),
      self: false,
    },
    {
      name: t("landing.preview.sample.grace"),
      email: t("landing.preview.sample.graceEmail"),
      role: t("landing.preview.roles.member"),
      self: false,
    },
  ];
  return (
    <Window label="/app/acme/settings">
      <div className="p-5 text-sm">
        <div className="rounded-lg border">
          <div className="border-b px-4 py-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <UsersIcon className="size-3.5" />
              {t("landing.preview.invites.membersTitle")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("landing.preview.invites.membersDescription")}
            </p>
          </div>
          <div className="divide-y">
            {members.map((m) => (
              <div key={m.email} className="flex items-center gap-3 px-4 py-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {m.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {m.name}
                    {m.self ? (
                      <span className="text-muted-foreground">
                        {" "}
                        {t("landing.preview.invites.you")}
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                </div>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs",
                    m.self ? "bg-muted text-muted-foreground" : "border text-muted-foreground",
                  )}
                >
                  {m.role}
                </span>
                {!m.self ? <Trash2Icon className="size-3.5 text-muted-foreground/50" /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Window>
  );
}

/** Invite form + pending list — Settings → Invites. */
export function TenantInvitesMock() {
  const { t } = useTranslation();
  return (
    <Window label="/app/acme/settings">
      <div className="space-y-4 p-5 text-sm">
        <div className="rounded-lg border">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">{t("landing.preview.invites.title")}</p>
            <p className="text-xs text-muted-foreground">
              {t("landing.preview.invites.description")}
            </p>
          </div>
          <div className="flex items-end gap-2 p-4">
            <div className="flex-1">
              <p className="mb-1 text-xs font-medium">{t("landing.preview.invites.email")}</p>
              <div className="flex h-9 items-center rounded-md border px-3 text-sm text-muted-foreground">
                {t("landing.preview.sample.samAcmeEmail")}
              </div>
            </div>
            <div className="flex h-9 items-center gap-1 rounded-md border px-3 text-sm text-muted-foreground">
              {t("landing.preview.roles.member")}
              <ChevronsUpDownIcon className="size-3.5" />
            </div>
            <div className="flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
              {t("landing.preview.invites.invite")}
            </div>
          </div>
        </div>
        <div className="rounded-lg border">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">{t("landing.preview.tenants.pending")}</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {t("landing.preview.sample.samAcmeEmail")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("landing.preview.tenants.expires")}
              </p>
            </div>
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {t("landing.preview.roles.member")}
            </span>
            <Trash2Icon className="size-3.5 text-muted-foreground/50" />
          </div>
        </div>
      </div>
    </Window>
  );
}
