import { useTranslation } from "react-i18next";
import {
  BoxIcon,
  CheckIcon,
  CheckSquareIcon,
  ChevronsUpDownIcon,
  HomeIcon,
  KeyRoundIcon,
  PlusIcon,
  SettingsIcon,
  SparklesIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
import { Field } from "./field";
import { Window } from "@app/ui/browser-window";

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

/** App shell body without browser chrome — reuse inside DesktopAppFrame / PhoneFrame. */
export function ShellBody({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const nav = [
    { icon: HomeIcon, label: t("landing.preview.nav.home"), active: true },
    { icon: CheckSquareIcon, label: t("landing.preview.nav.tasks"), active: false },
    { icon: SettingsIcon, label: t("landing.preview.nav.settings"), active: false },
  ];
  return (
    <div className={`relative flex text-sm ${compact ? "min-h-64" : "min-h-72"}`}>
      <aside className={`flex flex-col gap-3 border-r p-3 ${compact ? "w-28" : "w-44"}`}>
        <div className="flex items-center gap-2 px-2 font-semibold">
          <BoxIcon className="size-4" />
          {!compact ? t("brand") : null}
        </div>
        {!compact ? (
          <div className="flex items-center justify-between rounded-md border px-3 py-1.5 text-xs">
            <span className="truncate">{t("landing.preview.sample.tenant")}</span>
            <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
          </div>
        ) : null}
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${
                item.active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              <item.icon className="size-3.5 shrink-0" />
              {!compact ? item.label : null}
            </div>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1 p-4">
        <p className="text-sm font-semibold">
          {t("landing.preview.shell.hi", { name: t("landing.preview.sample.adaFirst") })}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {t("landing.preview.shell.youreIn")}{" "}
          <span className="font-medium text-foreground">{t("landing.preview.sample.tenant")}</span>
        </p>
        <div className={`mt-3 grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
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
          <Field label={t("landing.preview.name")} value={t("landing.preview.sample.ada")} />
          <div className="h-2" />
          <Field label={t("landing.preview.email")} value={t("landing.preview.sample.adaEmail")} />
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
