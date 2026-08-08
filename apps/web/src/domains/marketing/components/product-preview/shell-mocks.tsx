import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckIcon,
  CheckSquareIcon,
  ChevronsUpDownIcon,
  CopyIcon,
  CreditCardIcon,
  HomeIcon,
  KeyRoundIcon,
  LogOutIcon,
  PlusIcon,
  PlugIcon,
  SettingsIcon,
  SparklesIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
import { brand } from "@app/shared";
import { AppLogo } from "@/brand/logo";
import { Field } from "./field";
import { Window } from "@app/ui/browser-window";
import { Terminal } from "@app/ui/terminal";
import { cn } from "@app/ui/lib/utils";

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
                {t("landing.preview.sample.cursor")}
              </div>
            </div>
            <div className="flex h-9 items-center gap-1 rounded-md border px-3 text-sm text-muted-foreground">
              {t("landing.preview.sample.tenant")}
              <ChevronsUpDownIcon className="size-3.5" />
            </div>
            <div className="flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
              {t("landing.preview.mcp.create")}
            </div>
          </div>
          <div className="mx-4 mb-4 divide-y rounded-md border">
            <div className="flex items-center justify-between gap-2 px-3 py-2.5 text-xs">
              <div className="min-w-0">
                <p className="truncate font-medium">{t("landing.preview.sample.cursor")}</p>
                <p className="text-muted-foreground">{t("landing.preview.sample.tenant")}</p>
              </div>
              <Trash2Icon className="size-3.5 shrink-0 text-muted-foreground/60" />
            </div>
          </div>
        </div>
      </div>
    </Window>
  );
}

/** One-time raw key reveal after create — matches CreatedKeyPanel. */
export function McpCreatedKeyMock() {
  const { t } = useTranslation();
  return (
    <Window label="/app/acme/integrations">
      <div className="space-y-3 p-5 text-sm">
        <div className="grid gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div>
            <p className="text-sm font-medium">{t("landing.preview.mcp.copyNow")}</p>
            <p className="text-xs text-muted-foreground">
              {t("landing.preview.mcp.scopedTo", {
                tenant: t("landing.preview.sample.tenant"),
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-md border bg-background px-3 py-2 font-mono text-[11px]">
              abk_a1b2c3d4e5f6…
            </code>
            <div className="flex size-9 items-center justify-center rounded-md border">
              <CopyIcon className="size-3.5" />
            </div>
          </div>
          <div className="rounded-md border bg-muted/40 p-3">
            <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
              {`{
  "mcpServers": {
    "${brand.mcpServerName}": {
      "url": "https://acme.app/api/mcp",
      "headers": { "Authorization": "Bearer abk_…" }
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

/**
 * External agent (Claude Code) using the same MCP tools over HTTP —
 * not only the in-app FAB.
 */
export function McpExternalAgentMock() {
  const { t } = useTranslation();
  return (
    <Terminal
      label={t("landing.preview.mcp.claudeLabel")}
      lines={[
        { text: t("landing.preview.mcp.claudeConnected"), muted: true },
        {
          text: t("landing.preview.mcp.claudeTools", { server: brand.mcpServerName }),
          muted: true,
        },
        { prompt: true, text: t("landing.preview.mcp.claudePrompt") },
        { text: t("landing.preview.mcp.claudeToolCall"), muted: true },
        { text: t("landing.preview.mcp.claudeToolResult"), muted: true },
        { text: t("landing.preview.mcp.claudeReply") },
      ]}
    />
  );
}

type ShellChromeProps = {
  compact?: boolean;
  switcherOpen?: boolean;
  menuOpen?: boolean;
};

/** App shell body without browser chrome — reuse inside DesktopAppFrame / PhoneFrame. */
export function ShellBody({ compact = false, switcherOpen, menuOpen }: ShellChromeProps) {
  const { t } = useTranslation();
  const nav = [
    { icon: HomeIcon, label: t("landing.preview.nav.home"), active: true },
    { icon: CheckSquareIcon, label: t("landing.preview.nav.tasks"), active: false },
    { icon: SettingsIcon, label: t("landing.preview.nav.settings"), active: false },
  ];
  const tenants = [
    t("landing.preview.sample.tenant"),
    t("landing.preview.sample.adaWorkspace"),
  ];
  const menuItems = [
    { icon: UserIcon, label: t("landing.preview.shell.menuAccount") },
    { icon: CreditCardIcon, label: t("landing.preview.shell.menuBilling") },
    { icon: PlugIcon, label: t("landing.preview.shell.menuIntegrations") },
  ];

  return (
    <div className={cn("relative flex text-sm", compact ? "min-h-64" : "min-h-72")}>
      <aside className={cn("flex flex-col gap-3 border-r p-3", compact ? "w-28" : "w-44")}>
        <div className="flex items-center gap-2 px-2 font-semibold">
          <AppLogo className="size-4" />
          {!compact ? t("brand") : null}
        </div>
        {!compact ? (
          <div className="relative">
            <div
              className={cn(
                "flex items-center justify-between rounded-md border px-3 py-1.5 text-xs",
                switcherOpen && "bg-accent",
              )}
            >
              <span className="truncate">{tenants[0]}</span>
              <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
            </div>
            {switcherOpen ? (
              <div className="absolute top-full right-0 left-0 z-20 mt-1 overflow-hidden rounded-md border bg-popover shadow-md">
                <p className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
                  {t("landing.preview.shell.yourTenants")}
                </p>
                {tenants.map((name, i) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs"
                  >
                    <span className="min-w-0 flex-1 truncate">{name}</span>
                    {i === 0 ? <CheckIcon className="size-3 shrink-0 text-primary" /> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium",
                item.active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-3.5 shrink-0" />
              {!compact ? item.label : null}
            </div>
          ))}
        </nav>
        {!compact ? (
          <div className="relative mt-auto space-y-2 border-t pt-2">
            <div className="flex items-center gap-1 px-1 text-[10px] text-muted-foreground">
              <span className="rounded border px-1.5 py-0.5">{t("landing.preview.shell.theme")}</span>
            </div>
            <div
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5",
                menuOpen && "bg-accent",
              )}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {t("landing.preview.sample.adaInitials")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{t("landing.preview.sample.ada")}</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {t("landing.preview.sample.adaEmail")}
                </p>
              </div>
            </div>
            {menuOpen ? (
              <div className="absolute bottom-full left-0 z-20 mb-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
                {menuItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-foreground"
                  >
                    <item.icon className="size-3.5 text-muted-foreground" />
                    {item.label}
                  </div>
                ))}
                <div className="border-t" />
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-foreground">
                  <LogOutIcon className="size-3.5 text-muted-foreground" />
                  {t("landing.preview.shell.signOut")}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </aside>
      <div className="min-w-0 flex-1 p-4">
        <p className="text-sm font-semibold">
          {t("landing.preview.shell.hi", { name: t("landing.preview.sample.adaFirst") })}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {t("landing.preview.shell.youreIn")}{" "}
          <span className="font-medium text-foreground">{t("landing.preview.sample.tenant")}</span>
        </p>
        <div className={cn("mt-3 grid gap-2", compact ? "grid-cols-1" : "grid-cols-2")}>
          <div className="rounded-lg border p-2.5">
            <p className="text-[11px] font-semibold">{t("landing.preview.shell.members")}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {t("landing.preview.shell.peopleAccess")}
            </p>
          </div>
          {!compact ? (
            <div className="rounded-lg border p-2.5">
              <p className="text-[11px] font-semibold">{t("landing.preview.shell.tasksCount")}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {t("landing.preview.shell.exampleResource")}
              </p>
            </div>
          ) : null}
        </div>
      </div>
      <div className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
        <SparklesIcon className="size-4" />
      </div>
    </div>
  );
}

export function ShellMock() {
  return (
    <Window label="/app/acme">
      <ShellBody />
    </Window>
  );
}

/** Tenant switcher open — only appears when the user belongs to 2+ workspaces. */
export function TenantSwitcherMock() {
  return (
    <Window label="/app/acme">
      <ShellBody switcherOpen />
    </Window>
  );
}

/** User menu open — account, billing, integrations, sign out. */
export function UserMenuMock() {
  return (
    <Window label="/app/acme">
      <ShellBody menuOpen />
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
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-md border",
                  task.done ? "border-primary bg-primary text-primary-foreground" : "border-input",
                )}
              >
                {task.done && <CheckIcon className="size-3" />}
              </span>
              <span
                className={cn(
                  "flex-1 text-xs",
                  task.done && "text-muted-foreground line-through",
                )}
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

function AccountPageChrome({ children }: { children: ReactNode }) {
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
        {children}
      </div>
    </Window>
  );
}

function ProfileCard() {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
        <UserIcon className="size-3.5" /> {t("landing.preview.account.profile")}
      </div>
      <Field label={t("landing.preview.name")} value={t("landing.preview.sample.ada")} />
      <div className="h-2" />
      <Field label={t("landing.preview.email")} value={t("landing.preview.sample.adaEmail")} />
      <div className="mt-3 flex justify-end">
        <div className="flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">
          {t("landing.preview.account.save")}
        </div>
      </div>
    </div>
  );
}

function PasswordCard() {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
        <KeyRoundIcon className="size-3.5" /> {t("landing.preview.account.password")}
      </div>
      <Field label={t("landing.preview.account.currentPassword")} value="••••••••" mono />
      <div className="h-2" />
      <Field label={t("landing.preview.account.newPassword")} value="••••••••" mono />
      <div className="mt-3 flex justify-end">
        <div className="flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">
          {t("landing.preview.account.changePassword")}
        </div>
      </div>
    </div>
  );
}

/** Profile card only — matches ProfileSection. */
export function ProfileMock() {
  return (
    <AccountPageChrome>
      <ProfileCard />
    </AccountPageChrome>
  );
}

/** Password card only — matches PasswordSection. */
export function PasswordMock() {
  return (
    <AccountPageChrome>
      <PasswordCard />
    </AccountPageChrome>
  );
}

/** Both cards in one window — thin product chapter list. */
export function AccountMock() {
  return (
    <AccountPageChrome>
      <ProfileCard />
      <PasswordCard />
    </AccountPageChrome>
  );
}
