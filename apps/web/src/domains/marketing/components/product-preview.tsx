import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";
import {
  BoxIcon,
  CheckIcon,
  CheckSquareIcon,
  ChevronsUpDownIcon,
  DatabaseIcon,
  GitBranchIcon,
  HomeIcon,
  KeyRoundIcon,
  MailIcon,
  PlusIcon,
  SendIcon,
  ServerIcon,
  SettingsIcon,
  SparklesIcon,
  TableIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";

/** Static, faithful mockups of the product UI — no data or app imports. */

/** Just the browser chrome bar (dots + label), so it can stay fixed while the body swaps. */
export function WindowBar({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
      <span className="size-2.5 rounded-full bg-muted-foreground/25" />
      <span className="size-2.5 rounded-full bg-muted-foreground/25" />
      <span className="size-2.5 rounded-full bg-muted-foreground/25" />
      <span className="ml-2 truncate font-mono text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

/** Chrome frame so a mock reads as a real screen without pretending to be one. */
function Window({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <WindowBar label={label} />
      {children}
    </div>
  );
}

export function AgentChatMock() {
  const { t } = useTranslation();
  return (
    <Window label={t("landing.preview.window.assistant")}>
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <SparklesIcon className="size-4" />
        <span className="flex-1 text-sm font-semibold">{t("landing.preview.agent.title")}</span>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
            {t("landing.preview.agent.suggestion")}
          </div>
        </div>
        <div className="flex">
          <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm">
            {t("landing.preview.agent.reply")}
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                {t("landing.preview.agent.chip")}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-end gap-2 border-t p-3">
        <div className="flex h-9 flex-1 items-center rounded-md border px-3 text-sm text-muted-foreground">
          {t("landing.preview.agent.placeholder")}
        </div>
        <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <SendIcon className="size-4" />
        </div>
      </div>
    </Window>
  );
}

/** Shared field/button primitives so every auth screen looks like the real one. */
function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium">{label}</p>
      <div
        className={`flex h-9 items-center rounded-md border px-3 text-sm text-muted-foreground ${
          mono ? "tracking-widest" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  return (
    <div className="flex h-9 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground">
      {label}
    </div>
  );
}

/** The inner content of an auth screen (no chrome), so it can crossfade in place. */
function AuthBody({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-5 bg-muted/40 p-4 sm:p-8">
      <div className="flex items-center gap-2 font-semibold">
        <BoxIcon className="size-5" />
        {t("brand")}
      </div>
      <div className="w-full max-w-xs rounded-xl border bg-card p-5 text-left shadow-sm sm:p-6">
        <p className="text-lg font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <div className="mt-5 space-y-3">{children}</div>
      </div>
      <p className="text-xs text-muted-foreground">{footer}</p>
    </div>
  );
}

/** A single centered auth screen, filling a full section like the other mocks. */
function AuthScreen({
  route,
  ...body
}: {
  route: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: string;
}) {
  return (
    <Window label={route}>
      <AuthBody {...body} />
    </Window>
  );
}

export function LoginMock() {
  const { t } = useTranslation();
  return (
    <AuthScreen
      route="/login"
      title={t("landing.preview.login.title")}
      description={t("landing.preview.login.description")}
      footer={t("landing.preview.login.footer")}
    >
      <Field label={t("landing.preview.email")} value="you@example.com" />
      <Field label={t("landing.preview.password")} value="••••••••" mono />
      <SubmitButton label={t("landing.preview.login.submit")} />
    </AuthScreen>
  );
}

function RegisterBody() {
  const { t } = useTranslation();
  return (
    <AuthBody
      title={t("landing.preview.register.title")}
      description={t("landing.preview.register.description")}
      footer={t("landing.preview.register.footer")}
    >
      <Field label={t("landing.preview.name")} value="Ada Lovelace" />
      <Field label={t("landing.preview.email")} value="you@example.com" />
      <Field label={t("landing.preview.password")} value="••••••••" mono />
      <SubmitButton label={t("landing.preview.register.submit")} />
    </AuthBody>
  );
}

function ForgotPasswordBody() {
  const { t } = useTranslation();
  return (
    <AuthBody
      title={t("landing.preview.forgot.title")}
      description={t("landing.preview.forgot.description")}
      footer={t("landing.preview.forgot.footer")}
    >
      <Field label={t("landing.preview.email")} value="you@example.com" />
      <SubmitButton label={t("landing.preview.forgot.submit")} />
    </AuthBody>
  );
}

function ResetPasswordBody() {
  const { t } = useTranslation();
  return (
    <AuthBody
      title={t("landing.preview.reset.title")}
      description={t("landing.preview.reset.description")}
      footer={t("landing.preview.reset.footer")}
    >
      <Field label={t("landing.preview.reset.newPassword")} value="••••••••" mono />
      <Field label={t("landing.preview.reset.confirmPassword")} value="••••••••" mono />
      <SubmitButton label={t("landing.preview.reset.submit")} />
    </AuthBody>
  );
}

/** An email in an inbox frame: header row + the rendered template body with a CTA. */
function EmailBody({
  subject,
  heading,
  body,
  cta,
}: {
  subject: string;
  heading: string;
  body: React.ReactNode;
  cta: string;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailIcon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{subject}</p>
          <p className="truncate text-xs text-muted-foreground">
            {t("brand")} &lt;no-reply@appbase.dev&gt; → you@example.com
          </p>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
          {t("landing.preview.now")}
        </span>
      </div>
      <div className="bg-muted/40 p-4 sm:p-6">
        <div className="mx-auto max-w-sm rounded-xl border bg-card p-5 text-center shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-center gap-2 font-semibold">
            <BoxIcon className="size-5" />
            {t("brand")}
          </div>
          <p className="text-base font-semibold">{heading}</p>
          <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          <div className="mt-5 flex h-9 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground">
            {cta}
          </div>
        </div>
      </div>
    </>
  );
}

function VerifyEmailBody() {
  const { t } = useTranslation();
  return (
    <EmailBody
      subject={t("landing.preview.verifyEmail.subject")}
      heading={t("landing.preview.verifyEmail.heading")}
      body={t("landing.preview.verifyEmail.body")}
      cta={t("landing.preview.verifyEmail.cta")}
    />
  );
}

function ResetEmailBody() {
  const { t } = useTranslation();
  return (
    <EmailBody
      subject={t("landing.preview.resetEmail.subject")}
      heading={t("landing.preview.resetEmail.heading")}
      body={t("landing.preview.resetEmail.body")}
      cta={t("landing.preview.resetEmail.cta")}
    />
  );
}

function InviteMembersBody() {
  const { t } = useTranslation();
  const members = [
    {
      name: "Ada Lovelace",
      email: "ada@acme.com",
      role: t("landing.preview.roles.owner"),
      self: true,
    },
    {
      name: "Alan Turing",
      email: "alan@acme.com",
      role: t("landing.preview.roles.admin"),
      self: false,
    },
  ];
  return (
    <div className="space-y-4 p-5">
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
              sam@acme.com
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
          <p className="text-sm font-semibold">{t("landing.preview.invites.membersTitle")}</p>
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
                  {m.self && (
                    <span className="text-muted-foreground">
                      {" "}
                      {t("landing.preview.invites.you")}
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">{m.email}</p>
              </div>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InviteEmailBody() {
  const { t } = useTranslation();
  return (
    <EmailBody
      subject={t("landing.preview.inviteEmail.subject")}
      heading={t("landing.preview.inviteEmail.heading")}
      body={
        <>
          {t("landing.preview.inviteEmail.bodyBefore")}
          <span className="font-medium text-foreground">Acme Inc</span>
          {t("landing.preview.inviteEmail.bodyAfter")}
        </>
      }
      cta={t("landing.preview.inviteEmail.cta")}
    />
  );
}

function AdminShell({
  active,
  children,
}: {
  active: "people" | "invites" | "tenants" | "plans";
  children: React.ReactNode;
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

function AdminPeopleBody() {
  const { t } = useTranslation();
  const people = [
    {
      name: "Ada Lovelace",
      email: "ada@acme.com",
      admin: true,
      self: true,
    },
    {
      name: "Alan Turing",
      email: "alan@acme.com",
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

function AdminInvitesBody() {
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
                sam@example.com
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
            <span className="min-w-0 flex-1 truncate">sam@example.com</span>
            <span className="text-[10px] text-muted-foreground">
              {t("landing.preview.admin.expires")}
            </span>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function PlatformInviteEmailBody() {
  const { t } = useTranslation();
  return (
    <EmailBody
      subject={t("landing.preview.platformInviteEmail.subject")}
      heading={t("landing.preview.platformInviteEmail.heading")}
      body={t("landing.preview.platformInviteEmail.bodyBefore")}
      cta={t("landing.preview.platformInviteEmail.cta")}
    />
  );
}

function AdminPlansBody() {
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

function AdminTenantsPlanBody() {
  const { t } = useTranslation();
  const tenants = [
    {
      name: "Acme Inc",
      slug: "acme",
      plan: t("landing.preview.plans.starterName"),
      members: [
        { name: "Ada Lovelace", email: "ada@acme.com", role: t("landing.preview.roles.owner") },
        { name: "Grace Hopper", email: "grace@acme.com", role: t("landing.preview.roles.admin") },
        { name: "Alan Turing", email: "alan@acme.com", role: t("landing.preview.roles.member") },
      ],
    },
    {
      name: "Ada's Workspace",
      slug: "ada",
      plan: t("landing.preview.plans.freeName"),
      members: [
        { name: "Ada Lovelace", email: "ada@example.com", role: t("landing.preview.roles.owner") },
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

export function McpKeysMock() {
  const { t } = useTranslation();
  return (
    <Window label="/app/acme/integrations">
      <div className="space-y-4 p-5">
        <div className="rounded-lg border">
          <div className="border-b px-4 py-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <KeyRoundIcon className="size-3.5" /> {t("landing.preview.mcp.title")}
            </p>
            <p className="text-xs text-muted-foreground">{t("landing.preview.mcp.description")}</p>
          </div>
          <div className="flex items-end gap-2 p-4">
            <div className="flex-1">
              <p className="mb-1 text-xs font-medium">{t("landing.preview.name")}</p>
              <div className="flex h-9 items-center rounded-md border px-3 text-sm text-muted-foreground">
                Cursor
              </div>
            </div>
            <div className="flex h-9 items-center gap-1 rounded-md border px-3 text-sm text-muted-foreground">
              Acme Inc
              <ChevronsUpDownIcon className="size-3.5" />
            </div>
            <div className="flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
              {t("landing.preview.mcp.create")}
            </div>
          </div>
          <div className="mx-4 mb-4 rounded-md border bg-muted/40 p-3">
            <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
              {`{
  "mcpServers": {
    "app-base": {
      "url": "https://acme.app/api/mcp",
      "headers": { "Authorization": "Bearer abk_a1b2c3…" }
    }
  }
}`}
            </p>
          </div>
        </div>
      </div>
    </Window>
  );
}

export function ShellMock() {
  const { t } = useTranslation();
  const nav = [
    { icon: HomeIcon, label: t("landing.preview.nav.home"), active: true },
    { icon: CheckSquareIcon, label: t("landing.preview.nav.tasks"), active: false },
    { icon: SettingsIcon, label: t("landing.preview.nav.settings"), active: false },
  ];
  return (
    <Window label="/app/acme">
      <div className="relative flex min-h-72 text-sm">
        <aside className="flex w-44 flex-col gap-3 border-r p-3">
          <div className="flex items-center gap-2 px-2 font-semibold">
            <BoxIcon className="size-4" />
            {t("brand")}
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-1.5 text-xs">
            <span className="truncate">Acme Inc</span>
            <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {nav.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${
                  item.active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </div>
            ))}
          </nav>
          <div className="flex items-center gap-2 rounded-md p-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
              AD
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">Ada Lovelace</p>
              <p className="truncate text-[10px] text-muted-foreground">ada@acme.com</p>
            </div>
          </div>
        </aside>
        <div className="flex-1 p-5">
          <p className="text-base font-semibold">{t("landing.preview.shell.hi")}</p>
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.shell.youreIn")}{" "}
            <span className="font-medium text-foreground">Acme Inc</span>
            <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px]">
              {t("landing.preview.roles.owner")}
            </span>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold">{t("landing.preview.shell.members")}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {t("landing.preview.shell.peopleAccess")}
              </p>
              <p className="mt-3 flex items-center gap-1 text-[11px]">
                {t("landing.preview.shell.manageMembers")} <CheckIcon className="size-3" />
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold">{t("landing.preview.shell.tasksCount")}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {t("landing.preview.shell.exampleResource")}
              </p>
              <p className="mt-3 flex items-center gap-1 text-[11px]">
                {t("landing.preview.shell.viewTasks")} <CheckIcon className="size-3" />
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <SparklesIcon className="size-5" />
        </div>
      </div>
    </Window>
  );
}

export function TasksMock() {
  const { t } = useTranslation();
  const items = t("landing.preview.tasks.items", { returnObjects: true }) as string[];
  const tasks = (Array.isArray(items) ? items : []).map((title, i) => ({
    title,
    done: i < 2,
  }));
  return (
    <Window label="/app/acme/tasks">
      <div className="space-y-4 p-5 text-sm">
        <div>
          <p className="text-base font-semibold">{t("landing.preview.tasks.title")}</p>
          <p className="text-xs text-muted-foreground">{t("landing.preview.tasks.left")}</p>
        </div>
        <div className="flex gap-2">
          <div className="flex h-9 flex-1 items-center rounded-md border px-3 text-xs text-muted-foreground">
            {t("landing.preview.tasks.placeholder")}
          </div>
          <div className="flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">
            <PlusIcon className="size-3.5" /> {t("landing.preview.tasks.add")}
          </div>
        </div>
        <div className="divide-y rounded-lg border">
          {tasks.map((task) => (
            <div key={task.title} className="flex items-center gap-3 px-3 py-2.5">
              <span
                className={`flex size-4 shrink-0 items-center justify-center rounded-md border ${
                  task.done ? "border-primary bg-primary text-primary-foreground" : "border-input"
                }`}
              >
                {task.done && <CheckIcon className="size-3" />}
              </span>
              <span
                className={`flex-1 text-xs ${
                  task.done ? "text-muted-foreground line-through" : ""
                }`}
              >
                {task.title}
              </span>
              <Trash2Icon className="size-3.5 text-muted-foreground/60" />
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}

export function AccountMock() {
  const { t } = useTranslation();
  return (
    <Window label="/app/acme/account">
      <div className="space-y-4 p-5 text-sm">
        <div>
          <p className="text-base font-semibold">{t("landing.preview.account.title")}</p>
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.account.description")}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
            <UserIcon className="size-3.5" /> {t("landing.preview.account.profile")}
          </div>
          <Field label={t("landing.preview.name")} value="Ada Lovelace" />
          <div className="h-2" />
          <Field label={t("landing.preview.email")} value="ada@acme.com" />
        </div>
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
            <KeyRoundIcon className="size-3.5" /> {t("landing.preview.account.password")}
          </div>
          <Field label={t("landing.preview.account.newPassword")} value="••••••••" mono />
        </div>
      </div>
    </Window>
  );
}

/** A single column row inside a schema-map table card. */
export type Column = { name: string; type: string; badge?: "PK" | "FK" | "UQ" };

export function TableCard({
  name,
  columns,
  accent,
}: {
  name: string;
  columns: Column[];
  accent?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div
        className={`flex items-center gap-1.5 border-b px-3 py-1.5 font-mono text-[11px] font-semibold ${
          accent ? "bg-primary/10 text-primary" : "bg-muted/50"
        }`}
      >
        <TableIcon className="size-3" />
        {name}
      </div>
      <div className="divide-y">
        {columns.map((col) => (
          <div key={col.name} className="flex items-center gap-2 px-3 py-1 font-mono text-[10px]">
            <span className={col.badge === "PK" ? "font-medium" : "text-muted-foreground"}>
              {col.name}
            </span>
            <span className="ml-auto text-muted-foreground/60">{col.type}</span>
            {col.badge && (
              <span
                className={`rounded px-1 text-[9px] font-semibold ${
                  col.badge === "FK"
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {col.badge}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Frame wrapper for a single domain's tables, labelled with its schema file. */
function SchemaWindow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Window label={label}>
      <div className="grid gap-2 bg-muted/30 p-4 sm:grid-cols-2">{children}</div>
    </Window>
  );
}

/** Auth domain: identity, sessions, single-use tokens and personal API keys. */
export function AuthTables() {
  return (
    <SchemaWindow label="domains/auth/schema.ts">
      <TableCard
        name="users"
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "name", type: "text" },
          { name: "email", type: "text", badge: "UQ" },
          { name: "password_hash", type: "text" },
          { name: "email_verified_at", type: "timestamptz" },
        ]}
      />
      <TableCard
        name="sessions"
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "user_id", type: "uuid", badge: "FK" },
          { name: "token_hash", type: "text", badge: "UQ" },
          { name: "expires_at", type: "timestamptz" },
        ]}
      />
      <TableCard
        name="action_tokens"
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "user_id", type: "uuid", badge: "FK" },
          { name: "purpose", type: "enum" },
          { name: "token_hash", type: "text", badge: "UQ" },
        ]}
      />
      <TableCard
        name="api_keys"
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "user_id", type: "uuid", badge: "FK" },
          { name: "tenant_id", type: "uuid", badge: "FK" },
          { name: "prefix", type: "text" },
        ]}
      />
    </SchemaWindow>
  );
}

/** Tenant domain: the workspaces, their membership join table and invites. */
export function TenantTables() {
  return (
    <SchemaWindow label="domains/tenant/schema.ts">
      <TableCard
        name="tenants"
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "name", type: "text" },
          { name: "slug", type: "text", badge: "UQ" },
          { name: "plan_id", type: "text" },
        ]}
      />
      <TableCard
        name="tenant_members"
        columns={[
          { name: "tenant_id", type: "uuid", badge: "FK" },
          { name: "user_id", type: "uuid", badge: "FK" },
          { name: "role", type: "enum" },
        ]}
      />
      <TableCard
        name="tenant_invites"
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "tenant_id", type: "uuid", badge: "FK" },
          { name: "email", type: "text" },
          { name: "role", type: "enum" },
        ]}
      />
    </SchemaWindow>
  );
}

/**
 * Plan catalog lives in code — tenants only store plan_id.
 * Shown with the same table-card chrome so it reads next to real schemas.
 */
export function PlansCatalog() {
  const { t } = useTranslation();
  return (
    <SchemaWindow label="domains/billing/plans.ts">
      <TableCard
        name="free"
        columns={[
          { name: "maxSeats", type: "1" },
          { name: "price / seat", type: "$0" },
          {
            name: t("landing.preview.plansCatalog.aiPerSeat"),
            type: t("landing.preview.plansCatalog.included"),
          },
        ]}
      />
      <TableCard
        name="starter"
        columns={[
          { name: "maxSeats", type: "3" },
          { name: "price / seat", type: "$5" },
          {
            name: t("landing.preview.plansCatalog.aiPerSeat"),
            type: t("landing.preview.plansCatalog.included"),
          },
        ]}
      />
      <TableCard
        name="pro"
        columns={[
          { name: "maxSeats", type: "10" },
          { name: "price / seat", type: "$5" },
          {
            name: t("landing.preview.plansCatalog.aiPerSeat"),
            type: t("landing.preview.plansCatalog.included"),
          },
        ]}
      />
      <TableCard
        name="usage"
        columns={[
          { name: "maxSeats", type: "∞" },
          { name: "price / seat", type: "$10" },
          {
            name: t("landing.preview.plansCatalog.aiPerSeat"),
            type: t("landing.preview.plansCatalog.passthrough"),
          },
        ]}
      />
    </SchemaWindow>
  );
}

/** AI spend ledger — append-only events per assistant request. */
export function UsageTables() {
  return (
    <SchemaWindow label="domains/usage/schema.ts">
      <TableCard
        name="ai_usage_events"
        accent
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "user_id", type: "uuid", badge: "FK" },
          { name: "tenant_id", type: "uuid", badge: "FK" },
          { name: "model", type: "text" },
          { name: "input_tokens", type: "int" },
          { name: "output_tokens", type: "int" },
          { name: "cost_micros", type: "int" },
          { name: "created_at", type: "timestamptz" },
        ]}
      />
    </SchemaWindow>
  );
}

/** Media metadata — bytes live in object storage. */
export function ImageTables() {
  return (
    <SchemaWindow label="domains/images/schema.ts">
      <TableCard
        name="images"
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "tenant_id", type: "uuid", badge: "FK" },
          { name: "author_id", type: "uuid", badge: "FK" },
          { name: "path", type: "text" },
          { name: "content_type", type: "text" },
          { name: "size_bytes", type: "int" },
        ]}
      />
    </SchemaWindow>
  );
}

/** Platform signup invites — orthogonal to tenant invites. */
export function PlatformTables() {
  return (
    <SchemaWindow label="domains/admin/schema.ts">
      <TableCard
        name="platform_invites"
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "email", type: "text" },
          { name: "token_hash", type: "text", badge: "UQ" },
          { name: "invited_by", type: "uuid", badge: "FK" },
          { name: "expires_at", type: "timestamptz" },
        ]}
      />
    </SchemaWindow>
  );
}

/** The example resource — the exact shape you copy for your own domains. */
export function TaskTable() {
  return (
    <Window label="domains/task/schema.ts">
      <div className="bg-muted/30 p-4">
        <TableCard
          name="tasks"
          accent
          columns={[
            { name: "id", type: "uuid", badge: "PK" },
            { name: "tenant_id", type: "uuid", badge: "FK" },
            { name: "author_id", type: "uuid", badge: "FK" },
            { name: "title", type: "text" },
            { name: "completed", type: "bool" },
            { name: "created_at", type: "timestamptz" },
          ]}
        />
      </div>
    </Window>
  );
}

/** A .env file: the variables the app reads, with which are required vs optional. */
export function EnvMock() {
  const { t } = useTranslation();
  const rows: { key: string; value: string; note?: string; optional?: boolean }[] = [
    { key: "DATABASE_URL", value: "postgres://app:app@localhost:5442/app_base" },
    { key: "APP_URL", value: "http://localhost:3000" },
    {
      key: "RESEND_API_KEY",
      value: "re_…",
      note: t("landing.preview.env.noResendNote"),
      optional: true,
    },
    { key: "MAIL_FROM", value: "App Base <onboarding@resend.dev>", optional: true },
    {
      key: "OPENAI_API_KEY",
      value: "sk-…",
      note: t("landing.preview.env.noKeyNote"),
      optional: true,
    },
    {
      key: "R2_PUBLIC_BASE_URL",
      value: "https://pub-….r2.dev",
      note: t("landing.preview.env.noR2Note"),
      optional: true,
    },
    { key: "SELF_SIGNUP_ENABLED", value: "true", optional: true },
    { key: "PLATFORM_ADMIN_EMAILS", value: "you@example.com", optional: true },
  ];
  return (
    <Window label=".env">
      <div className="space-y-2 bg-card p-4 font-mono text-[11px] leading-relaxed">
        {rows.map((row) => (
          <div key={row.key}>
            <div className="flex flex-wrap items-baseline gap-x-1">
              <span className="text-primary">{row.key}</span>
              <span className="text-muted-foreground/50">=</span>
              <span className="break-all text-muted-foreground">{row.value}</span>
              <span
                className={`ml-1 rounded px-1 text-[9px] ${
                  row.optional ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"
                }`}
              >
                {row.optional
                  ? t("landing.preview.env.optional")
                  : t("landing.preview.env.required")}
              </span>
            </div>
            {row.note && <p className="pl-0 text-[10px] text-muted-foreground/70"># {row.note}</p>}
          </div>
        ))}
      </div>
    </Window>
  );
}

/** A terminal window running the two commands that boot the whole stack locally. */
export function TerminalMock() {
  const lines: { prompt?: boolean; text: string; muted?: boolean }[] = [
    { prompt: true, text: "npm run setup" },
    { text: "✔ docker compose up — postgres:16 on :5442", muted: true },
    { text: "✔ migrations applied — 7 tables", muted: true },
    { text: "✔ seed — demo workspace + user", muted: true },
    { prompt: true, text: "npm run dev" },
    { text: "› api    http://localhost:5000", muted: true },
    { text: "› web    http://localhost:3000", muted: true },
  ];
  return (
    <Window label="bash — app-base">
      <div className="space-y-1 bg-card p-4 font-mono text-xs leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-2">
            {line.prompt ? (
              <span className="shrink-0 text-primary">$</span>
            ) : (
              <span className="shrink-0 text-transparent">$</span>
            )}
            <span className={line.muted ? "text-muted-foreground" : ""}>{line.text}</span>
          </div>
        ))}
      </div>
    </Window>
  );
}

/** A stylized Render dashboard: the two services the blueprint provisions. */
export function RenderMock() {
  const { t } = useTranslation();
  return (
    <Window label="dashboard.render.com">
      <div className="space-y-3 bg-muted/30 p-4">
        <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <ServerIcon className="size-4 text-primary" />
            <div>
              <p className="text-xs font-semibold">app</p>
              <p className="text-[10px] text-muted-foreground">
                {t("landing.preview.render.webService")}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            <span className="size-1.5 rounded-full bg-primary" /> {t("landing.preview.render.live")}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <DatabaseIcon className="size-4 text-primary" />
            <div>
              <p className="text-xs font-semibold">app-db</p>
              <p className="text-[10px] text-muted-foreground">
                {t("landing.preview.render.postgres")}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            <span className="size-1.5 rounded-full bg-primary" />{" "}
            {t("landing.preview.render.available")}
          </span>
        </div>

        <div className="rounded-lg border border-dashed px-3 py-2.5 text-[10px] text-muted-foreground">
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            <GitBranchIcon className="size-3" /> {t("landing.preview.render.autoDeploy")}
          </p>
          <p className="mt-1">{t("landing.preview.render.preDeploy")}</p>
        </div>
      </div>
    </Window>
  );
}

/** One screen inside the browser chrome: a route label and its bodyless content. */
export type Screen = { label: string; Body: ComponentType };

/**
 * Multi-screen flows for the carousel. Each entry keeps the browser chrome fixed
 * and only swaps the body inside, so alternating never resizes the frame.
 */
export const flows = {
  register: [
    { label: "/register", Body: RegisterBody },
    { label: "inbox", Body: VerifyEmailBody },
  ],
  recovery: [
    { label: "/forgot-password", Body: ForgotPasswordBody },
    { label: "inbox", Body: ResetEmailBody },
    { label: "/reset-password", Body: ResetPasswordBody },
  ],
  invite: [
    { label: "/app/acme/settings", Body: InviteMembersBody },
    { label: "inbox", Body: InviteEmailBody },
  ],
  admin: [
    { label: "/admin/users", Body: AdminPeopleBody },
    { label: "/admin/invites", Body: AdminInvitesBody },
    { label: "inbox", Body: PlatformInviteEmailBody },
  ],
  plans: [
    { label: "/admin/plans", Body: AdminPlansBody },
    { label: "/admin/tenants", Body: AdminTenantsPlanBody },
  ],
} satisfies Record<string, Screen[]>;
