import { useTranslation } from "react-i18next";
import {
  CopyIcon,
  DatabaseIcon,
  EyeIcon,
  FolderGit2Icon,
  GlobeIcon,
  LockIcon,
  PencilIcon,
  SearchIcon,
  ServerIcon,
} from "lucide-react";
import { brand } from "@app/shared";
import { Window } from "@app/ui/browser-window";
import { Terminal } from "@app/ui/terminal";
import { cn } from "@app/ui/lib/utils";

function githubRepoLabel(): string {
  try {
    const { pathname } = new URL(brand.repoUrl);
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 2) return `${parts[0]} / ${parts[1]}`;
  } catch {
    /* fall through */
  }
  return "you / app";
}

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
    { key: "MAIL_FROM", value: brand.defaultMailFrom, optional: true },
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
    { key: "PLATFORM_ADMIN_EMAILS", value: t("landing.preview.sample.youEmail"), optional: true },
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

/** Local Postgres via Docker Compose — the database page opens here. */
export function PostgresMock() {
  const { t } = useTranslation();
  return (
    <Window label="docker-compose.yml">
      <div className="space-y-3 bg-card p-4 font-mono text-[11px] leading-relaxed">
        <div className="space-y-1">
          <p>
            <span className="text-primary">services</span>
            <span className="text-muted-foreground">:</span>
          </p>
          <p className="pl-2">
            <span className="text-primary">postgres</span>
            <span className="text-muted-foreground">:</span>
          </p>
          <p className="pl-4">
            <span className="text-muted-foreground">image: </span>
            <span>postgres:16</span>
          </p>
          <p className="pl-4">
            <span className="text-muted-foreground">ports: </span>
            <span>&quot;5442:5432&quot;</span>
          </p>
          <p className="pl-4">
            <span className="text-muted-foreground">POSTGRES_DB: </span>
            <span>app_base</span>
          </p>
        </div>
        <div className="rounded-md border border-dashed px-3 py-2 text-[10px]">
          <p className="text-muted-foreground">{t("landing.dbCourse.postgres.visualEnv")}</p>
          <p className="mt-1 break-all">
            <span className="text-primary">DATABASE_URL</span>
            <span className="text-muted-foreground/50">=</span>
            <span className="text-muted-foreground">
              postgres://app:app@localhost:5442/app_base
            </span>
          </p>
        </div>
      </div>
    </Window>
  );
}

/** Migration terminal — generate then apply. */
export function MigrateMock() {
  const { t } = useTranslation();
  return (
    <Terminal
      label="bash — migrations"
      lines={[
        { prompt: true, text: "npm run db:generate" },
        { text: t("landing.dbCourse.migrateFlow.visualGenerate"), muted: true },
        { prompt: true, text: "npm run db:migrate" },
        { text: t("landing.dbCourse.migrateFlow.visualMigrate"), muted: true },
        { text: t("landing.dbCourse.migrateFlow.visualDone"), muted: true },
      ]}
    />
  );
}

/** When migrations run — local setup + Render preDeploy. */
export function MigrateWhenMock() {
  const { t } = useTranslation();
  return (
    <Terminal
      label="bash — when"
      lines={[
        { prompt: true, text: "npm run setup" },
        { text: t("landing.dbCourse.migrateWhen.visualSetup"), muted: true },
        { prompt: true, text: "npm run db:migrate" },
        { text: t("landing.dbCourse.migrateWhen.visualMigrate"), muted: true },
        { text: t("landing.dbCourse.migrateWhen.visualRender"), muted: true },
        { text: t("landing.dbCourse.migrateWhen.visualSkip"), muted: true },
      ]}
    />
  );
}

/** Seed console — demo user, tenant, sample tasks. */
export function SeedMock() {
  const { t } = useTranslation();
  return (
    <Terminal
      label="bash — seed"
      lines={[
        { prompt: true, text: "npm run db:seed" },
        { text: t("landing.dbCourse.seed.visualUser"), muted: true },
        { text: t("landing.dbCourse.seed.visualTenant"), muted: true },
        { text: t("landing.dbCourse.seed.visualTasks"), muted: true },
        { text: t("landing.dbCourse.seed.visualPassword"), muted: true },
      ]}
    />
  );
}

/** A terminal window running the two commands that boot the whole stack locally. */
export function TerminalMock() {
  return (
    <Terminal
      label={`bash — ${brand.mcpServerName}`}
      lines={[
        { prompt: true, text: "npm run setup" },
        { text: "✔ docker compose up — postgres:16 on :5442", muted: true },
        { text: "✔ migrations applied — 7 tables", muted: true },
        { text: "✔ seed — demo workspace + user", muted: true },
        { prompt: true, text: "npm run dev" },
        { text: "› api    http://localhost:5000", muted: true },
        { text: "› web    http://localhost:3000", muted: true },
      ]}
    />
  );
}

/** Render → New Blueprint → Connect a repository. */
export function RenderBlueprintMock() {
  const { t } = useTranslation();
  const primary = githubRepoLabel();
  const repos = [
    { label: primary, primary: true, updated: t("landing.preview.render.updatedRecent") },
    {
      label: t("landing.preview.render.sampleRepoOther"),
      primary: false,
      updated: t("landing.preview.render.updatedOlder"),
    },
    {
      label: t("landing.preview.render.sampleRepoDemo"),
      primary: false,
      updated: t("landing.preview.render.updatedOlder"),
    },
  ];
  return (
    <Window label="dashboard.render.com · New Blueprint">
      <div className="bg-[#0d0d0d] p-3 text-[10px] text-[#e3e3e3]">
        <p className="text-xs font-semibold tracking-tight">
          {t("landing.preview.render.blueprintTitle")}
        </p>
        <p className="mt-1 text-[9px] text-[#8a8a8a]">
          {t("landing.preview.render.blueprintSubtitle")}
        </p>
        <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-[#161616]">
          <div className="border-b border-white/10 px-3 py-2">
            <p className="text-[11px] font-semibold">{t("landing.preview.render.connectRepo")}</p>
            <div className="mt-2 flex items-center gap-1.5 rounded-md border border-white/10 bg-[#0d0d0d] px-2 py-1.5 text-[9px] text-[#6b6b6b]">
              <SearchIcon className="size-3 shrink-0" aria-hidden />
              <span>{t("landing.preview.render.search")}</span>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {repos.map((repo) => (
              <div
                key={repo.label}
                className={cn(
                  "flex items-center gap-2 px-3 py-2",
                  repo.primary && "bg-[#5b21b6]/15",
                )}
              >
                <FolderGit2Icon className="size-3.5 shrink-0 text-[#c4c4c4]" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="truncate font-medium">{repo.label}</span>
                    <LockIcon className="size-2.5 shrink-0 text-[#6b6b6b]" aria-hidden />
                  </div>
                  <p className="text-[9px] text-[#6b6b6b]">{repo.updated}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-1 text-[9px] font-semibold",
                    repo.primary
                      ? "bg-white text-[#0d0d0d]"
                      : "border border-white/15 text-[#c4c4c4]",
                  )}
                >
                  {t("landing.preview.render.connect")}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-2 text-[9px] text-[#8a8a8a]">
          {t("landing.preview.render.blueprintFootnote")}
        </p>
      </div>
    </Window>
  );
}

/** Render services list — web app + managed Postgres from the blueprint. */
export function RenderMock() {
  const { t } = useTranslation();
  const rows = [
    {
      name: t("landing.preview.sample.serviceApp"),
      icon: GlobeIcon,
      status: t("landing.preview.render.live"),
      runtime: t("landing.preview.render.runtimeNode"),
    },
    {
      name: t("landing.preview.sample.serviceDb"),
      icon: DatabaseIcon,
      status: t("landing.preview.render.available"),
      runtime: t("landing.preview.render.postgres"),
    },
  ];
  return (
    <Window label="dashboard.render.com">
      <div className="bg-[#0d0d0d] p-3 text-[10px] text-[#e3e3e3]">
        <div className="mb-2 grid grid-cols-[1.2fr_0.9fr_1fr] gap-2 px-2 font-medium tracking-wide text-[#8a8a8a] uppercase">
          <span>{t("landing.preview.render.colService")}</span>
          <span>{t("landing.preview.render.colStatus")}</span>
          <span>{t("landing.preview.render.colRuntime")}</span>
        </div>
        <div className="space-y-1.5">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.name}
                className="grid grid-cols-[1.2fr_0.9fr_1fr] items-center gap-2 rounded-lg border border-white/10 bg-[#161616] px-2 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Icon className="size-3.5 shrink-0 text-[#a78bfa]" aria-hidden />
                  <span className="truncate font-medium">{row.name}</span>
                </div>
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-medium text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  {row.status}
                </span>
                <span className="truncate rounded-md bg-white/5 px-2 py-0.5 text-[9px] text-[#c4c4c4]">
                  {row.runtime}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Window>
  );
}

/** Render → service → Environment — where production secrets are set. */
export function RenderEnvMock() {
  const { t } = useTranslation();
  const keys = [
    "APP_URL",
    "DATABASE_URL",
    "RESEND_API_KEY",
    "OPENAI_API_KEY",
    "MAIL_FROM",
    "SELF_SIGNUP_ENABLED",
    "PLATFORM_ADMIN_EMAILS",
    "CORS_ORIGIN",
  ];
  return (
    <Window label="dashboard.render.com · Environment">
      <div className="flex overflow-hidden bg-[#0d0d0d] text-[10px] text-[#e3e3e3]">
        <aside className="hidden w-[5.5rem] shrink-0 border-r border-white/10 bg-[#111] p-2 sm:block">
          <p className="mb-2 truncate text-[9px] font-semibold text-[#8a8a8a] uppercase">
            {t("landing.preview.render.manage")}
          </p>
          {["Shell", "Environment", "Scaling"].map((item, i) => (
            <div
              key={item}
              className={cn(
                "mb-0.5 truncate rounded-md px-1.5 py-1",
                i === 1 ? "bg-[#5b21b6]/40 text-[#ddd6fe]" : "text-[#9a9a9a]",
              )}
            >
              {i === 1 ? t("landing.preview.render.envTab") : item}
            </div>
          ))}
        </aside>
        <div className="min-w-0 flex-1 p-3">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <ServerIcon className="size-3.5 text-[#a78bfa]" aria-hidden />
                <p className="truncate text-xs font-semibold">
                  {t("landing.preview.sample.serviceApp")}
                </p>
              </div>
              <p className="mt-0.5 text-[9px] text-[#8a8a8a]">
                {t("landing.preview.render.envSubtitle")}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-medium">
              <PencilIcon className="size-2.5" aria-hidden />
              {t("landing.preview.render.edit")}
            </span>
          </div>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <div className="grid grid-cols-[1fr_1.1fr] gap-2 border-b border-white/10 bg-[#161616] px-2.5 py-1.5 text-[9px] font-medium tracking-wide text-[#8a8a8a] uppercase">
              <span>{t("landing.preview.render.colKey")}</span>
              <span>{t("landing.preview.render.colValue")}</span>
            </div>
            <div className="divide-y divide-white/5 bg-[#121212]">
              {keys.map((key) => (
                <div
                  key={key}
                  className="grid grid-cols-[1fr_1.1fr] items-center gap-2 px-2.5 py-1.5"
                >
                  <span className="truncate rounded-md bg-[#1c1c1c] px-2 py-1 font-mono text-[9px]">
                    {key}
                  </span>
                  <div className="flex min-w-0 items-center gap-1">
                    <span className="min-w-0 flex-1 truncate rounded-md bg-[#1c1c1c] px-2 py-1 font-mono text-[9px] tracking-widest text-[#6b6b6b]">
                      ••••••••••
                    </span>
                    <CopyIcon className="size-2.5 shrink-0 text-[#6b6b6b]" aria-hidden />
                    <EyeIcon className="size-2.5 shrink-0 text-[#6b6b6b]" aria-hidden />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-2 text-[9px] text-[#8a8a8a]">
            {t("landing.preview.render.envFootnote")}
          </p>
        </div>
      </div>
    </Window>
  );
}
