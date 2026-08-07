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
            <span className="truncate">{t("landing.preview.sample.tenant")}</span>
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
              {t("landing.preview.sample.adaInitials")}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{t("landing.preview.sample.ada")}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {t("landing.preview.sample.adaEmail")}
              </p>
            </div>
          </div>
        </aside>
        <div className="flex-1 p-5">
          <p className="text-base font-semibold">
            {t("landing.preview.shell.hi", { name: t("landing.preview.sample.adaFirst") })}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.shell.youreIn")}{" "}
            <span className="font-medium text-foreground">
              {t("landing.preview.sample.tenant")}
            </span>
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
