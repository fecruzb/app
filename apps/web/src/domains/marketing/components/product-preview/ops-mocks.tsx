import { useTranslation } from "react-i18next";
import {
  CloudUploadIcon,
  CopyIcon,
  CylinderIcon,
  DatabaseIcon,
  EyeIcon,
  FolderGit2Icon,
  GlobeIcon,
  LockIcon,
  PencilIcon,
  PlusIcon,
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

const DEFAULT_RENDER_ENV_KEYS = [
  "APP_URL",
  "DATABASE_URL",
  "RESEND_API_KEY",
  "OPENAI_API_KEY",
  "MAIL_FROM",
  "SELF_SIGNUP_ENABLED",
  "PLATFORM_ADMIN_EMAILS",
  "CORS_ORIGIN",
];

/** Render → service → Environment — where production secrets are set. */
export function RenderEnvMock({
  keys = DEFAULT_RENDER_ENV_KEYS,
  highlight,
  footnote,
}: {
  /** Keys shown in the table (defaults to a typical production set). */
  keys?: string[];
  /** Keys to visually emphasize (e.g. the ones this course just introduced). */
  highlight?: string[];
  footnote?: string;
} = {}) {
  const { t } = useTranslation();
  const emphasize = new Set(highlight ?? []);
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
                  className={cn(
                    "grid grid-cols-[1fr_1.1fr] items-center gap-2 px-2.5 py-1.5",
                    emphasize.has(key) && "bg-[#5b21b6]/20",
                  )}
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
            {footnote ?? t("landing.preview.render.envFootnote")}
          </p>
        </div>
      </div>
    </Window>
  );
}

/** Cloudflare R2 — buckets overview. */
export function R2BucketsMock() {
  const { t } = useTranslation();
  const buckets = [
    {
      name: t("landing.preview.sample.serviceApp"),
      objects: "0",
      size: "0 B",
      primary: true,
    },
    {
      name: t("landing.preview.r2.sampleBucketOther"),
      objects: "24",
      size: "12 MB",
      primary: false,
    },
  ];
  return (
    <Window label="dash.cloudflare.com · R2">
      <div className="bg-white p-3 text-[10px] text-zinc-800">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <CylinderIcon className="size-3.5 text-orange-500" aria-hidden />
              <p className="text-xs font-semibold">{t("landing.preview.r2.title")}</p>
            </div>
            <p className="mt-0.5 text-[9px] text-zinc-500">{t("landing.preview.r2.subtitle")}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#f6821f] px-2 py-1 text-[9px] font-semibold text-white">
            <PlusIcon className="size-2.5" aria-hidden />
            {t("landing.preview.r2.createBucket")}
          </span>
        </div>
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr] gap-2 border-b border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-[9px] font-medium text-zinc-500 uppercase">
            <span>{t("landing.preview.r2.colBucket")}</span>
            <span>{t("landing.preview.r2.colObjects")}</span>
            <span>{t("landing.preview.r2.colSize")}</span>
          </div>
          {buckets.map((b) => (
            <div
              key={b.name}
              className={cn(
                "grid grid-cols-[1.4fr_0.7fr_0.7fr] items-center gap-2 border-b border-zinc-100 px-2.5 py-2 last:border-0",
                b.primary && "bg-orange-50/80",
              )}
            >
              <span className="truncate font-medium">{b.name}</span>
              <span className="text-zinc-500">{b.objects}</span>
              <span className="text-zinc-500">{b.size}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-zinc-500">
          <span>
            {t("landing.preview.r2.accountId")}:{" "}
            <span className="font-mono tracking-wider">••••••••••••</span>
          </span>
          <span className="font-medium text-zinc-700">{t("landing.preview.r2.manageTokens")}</span>
        </div>
      </div>
    </Window>
  );
}

/** Cloudflare R2 — bucket objects (empty + public access). */
export function R2BucketObjectsMock() {
  const { t } = useTranslation();
  return (
    <Window label="dash.cloudflare.com · R2 · Objects">
      <div className="bg-white p-3 text-[10px] text-zinc-800">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold">
            {t("landing.preview.r2.title")}{" "}
            <span className="text-zinc-400">›</span>{" "}
            {t("landing.preview.sample.serviceApp")}
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-700">
            <GlobeIcon className="size-2.5" aria-hidden />
            {t("landing.preview.r2.publicEnabled")}
          </span>
        </div>
        <div className="mb-2 flex gap-3 border-b border-zinc-200 text-[9px]">
          <span className="border-b-2 border-zinc-900 pb-1.5 font-semibold">
            {t("landing.preview.r2.tabObjects")}
          </span>
          <span className="pb-1.5 text-zinc-400">{t("landing.preview.r2.tabSettings")}</span>
        </div>
        <div className="flex flex-col items-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-6 text-center">
          <CloudUploadIcon className="mb-2 size-6 text-zinc-400" aria-hidden />
          <p className="text-[11px] font-semibold">{t("landing.preview.r2.emptyTitle")}</p>
          <p className="mt-1 max-w-[16rem] text-[9px] text-zinc-500">
            {t("landing.preview.r2.emptyBody")}
          </p>
        </div>
      </div>
    </Window>
  );
}

/** Cloudflare R2 — bucket Settings (S3 API + public URL). */
export function R2BucketSettingsMock() {
  const { t } = useTranslation();
  return (
    <Window label="dash.cloudflare.com · R2 · Settings">
      <div className="bg-white p-3 text-[10px] text-zinc-800">
        <div className="mb-2 flex gap-3 border-b border-zinc-200 text-[9px]">
          <span className="pb-1.5 text-zinc-400">{t("landing.preview.r2.tabObjects")}</span>
          <span className="border-b-2 border-zinc-900 pb-1.5 font-semibold">
            {t("landing.preview.r2.tabSettings")}
          </span>
        </div>
        <p className="mb-2 text-[11px] font-semibold">{t("landing.preview.r2.general")}</p>
        <div className="space-y-2 rounded-lg border border-zinc-200 p-2.5">
          <div>
            <p className="text-[9px] font-medium text-zinc-500">{t("landing.preview.r2.name")}</p>
            <p className="font-medium">{t("landing.preview.sample.serviceApp")}</p>
          </div>
          <div>
            <p className="text-[9px] font-medium text-zinc-500">{t("landing.preview.r2.s3Api")}</p>
            <div className="mt-0.5 flex items-center gap-1 rounded-md bg-zinc-50 px-2 py-1 font-mono text-[9px] text-zinc-600">
              <span className="min-w-0 truncate">
                https://••••••••.r2.cloudflarestorage.com/
                {t("landing.preview.sample.serviceApp")}
              </span>
              <CopyIcon className="size-2.5 shrink-0 text-zinc-400" aria-hidden />
            </div>
          </div>
        </div>
        <div className="mt-2 rounded-lg border border-zinc-200 p-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold">{t("landing.preview.r2.publicDevUrl")}</p>
              <p className="mt-0.5 text-[9px] text-emerald-700">
                {t("landing.preview.r2.publicEnabled")}
              </p>
              <div className="mt-1 flex items-center gap-1 rounded-md bg-zinc-50 px-2 py-1 font-mono text-[9px] text-zinc-600">
                <span className="min-w-0 truncate">https://pub-••••••••.r2.dev</span>
                <CopyIcon className="size-2.5 shrink-0 text-zinc-400" aria-hidden />
              </div>
            </div>
          </div>
          <p className="mt-1.5 text-[9px] text-amber-700/90">{t("landing.preview.r2.publicNote")}</p>
        </div>
      </div>
    </Window>
  );
}

/** Cloudflare — Account API tokens list (R2 token). */
export function R2ApiTokensMock() {
  const { t } = useTranslation();
  return (
    <Window label="dash.cloudflare.com · API tokens">
      <div className="bg-white p-3 text-[10px] text-zinc-800">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold">{t("landing.preview.r2.tokensTitle")}</p>
            <p className="mt-0.5 text-[9px] text-zinc-500">{t("landing.preview.r2.tokensSubtitle")}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#2563eb] px-2 py-1 text-[9px] font-semibold text-white">
            {t("landing.preview.r2.createToken")}
          </span>
        </div>
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-[1.2fr_1fr_0.8fr] gap-2 border-b border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-[9px] font-medium text-zinc-500 uppercase">
            <span>{t("landing.preview.r2.colToken")}</span>
            <span>{t("landing.preview.r2.colPermissions")}</span>
            <span>{t("landing.preview.r2.colCreated")}</span>
          </div>
          <div className="grid grid-cols-[1.2fr_1fr_0.8fr] items-center gap-2 bg-blue-50/50 px-2.5 py-2">
            <span className="truncate font-medium">{t("landing.preview.r2.tokenName")}</span>
            <span className="truncate text-zinc-500">{t("landing.preview.r2.tokenPerms")}</span>
            <span className="text-zinc-500">{t("landing.preview.r2.tokenCreated")}</span>
          </div>
        </div>
        <p className="mt-2 text-[9px] text-zinc-500">{t("landing.preview.r2.tokensFootnote")}</p>
      </div>
    </Window>
  );
}

/** Cloudflare — Create token with R2 Storage Edit. */
export function R2CreateTokenMock() {
  const { t } = useTranslation();
  const perms = [
    { label: t("landing.preview.r2.permCatalog"), selected: false },
    { label: t("landing.preview.r2.permSql"), selected: false },
    { label: t("landing.preview.r2.permStorage"), selected: true },
  ];
  return (
    <Window label="dash.cloudflare.com · Create token">
      <div className="bg-white p-3 text-[10px] text-zinc-800">
        <p className="text-xs font-semibold">{t("landing.preview.r2.createTokenTitle")}</p>
        <div className="mt-2 space-y-2">
          <div>
            <p className="text-[9px] font-medium text-zinc-500">{t("landing.preview.r2.tokenNameLabel")}</p>
            <div className="mt-0.5 rounded-md border border-zinc-200 px-2 py-1 font-mono text-[9px]">
              {t("landing.preview.r2.tokenName")}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 p-2">
            <div className="mb-1.5 flex items-center gap-1.5">
              <SearchIcon className="size-3 text-zinc-400" aria-hidden />
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px]">r2</span>
            </div>
            <div className="space-y-1">
              {perms.map((p) => (
                <div
                  key={p.label}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2 py-1.5",
                    p.selected ? "bg-blue-50" : "bg-zinc-50/80",
                  )}
                >
                  <span className="truncate font-medium">{p.label}</span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[9px] font-semibold",
                      p.selected ? "bg-[#2563eb] text-white" : "bg-zinc-200 text-zinc-600",
                    )}
                  >
                    {p.selected
                      ? t("landing.preview.r2.permEdit")
                      : t("landing.preview.r2.permNone")}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[9px] text-zinc-500">{t("landing.preview.r2.createTokenFootnote")}</p>
        </div>
      </div>
    </Window>
  );
}

/** OpenAI platform — API keys list. */
export function OpenAiKeysMock() {
  const { t } = useTranslation();
  return (
    <Window label="platform.openai.com · API keys">
      <div className="flex overflow-hidden bg-[#0d0d0d] text-[10px] text-[#e3e3e3]">
        <aside className="hidden w-[5.25rem] shrink-0 border-r border-white/10 bg-[#111] p-2 sm:block">
          <p className="mb-2 truncate text-[9px] font-semibold text-[#8a8a8a] uppercase">
            {t("landing.preview.openai.nav")}
          </p>
          {["Home", "API keys", "Usage"].map((item, i) => (
            <div
              key={item}
              className={cn(
                "mb-0.5 truncate rounded-md px-1.5 py-1",
                i === 1 ? "bg-white/10 text-white" : "text-[#9a9a9a]",
              )}
            >
              {i === 1 ? t("landing.preview.openai.keysNav") : item}
            </div>
          ))}
        </aside>
        <div className="min-w-0 flex-1 p-3">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold">{t("landing.preview.openai.keysTitle")}</p>
              <p className="mt-0.5 text-[9px] text-[#8a8a8a]">
                {t("landing.preview.openai.keysSubtitle")}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white px-2 py-1 text-[9px] font-semibold text-[#0d0d0d]">
              <PlusIcon className="size-2.5" aria-hidden />
              {t("landing.preview.openai.createKey")}
            </span>
          </div>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <div className="grid grid-cols-[1fr_0.7fr_1fr_0.8fr] gap-2 border-b border-white/10 bg-[#161616] px-2.5 py-1.5 text-[9px] font-medium tracking-wide text-[#8a8a8a] uppercase">
              <span>{t("landing.preview.openai.colName")}</span>
              <span>{t("landing.preview.openai.colStatus")}</span>
              <span>{t("landing.preview.openai.colSecret")}</span>
              <span>{t("landing.preview.openai.colPerms")}</span>
            </div>
            <div className="grid grid-cols-[1fr_0.7fr_1fr_0.8fr] items-center gap-2 bg-[#121212] px-2.5 py-2">
              <span className="truncate font-medium">{brand.displayName}</span>
              <span className="inline-flex w-fit items-center gap-1 text-[9px] text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                {t("landing.preview.openai.active")}
              </span>
              <span className="truncate font-mono text-[9px] text-[#8a8a8a]">sk-…••••</span>
              <span className="text-[#c4c4c4]">{t("landing.preview.openai.permsAll")}</span>
            </div>
          </div>
          <p className="mt-2 text-[9px] text-[#8a8a8a]">{t("landing.preview.openai.keysFootnote")}</p>
        </div>
      </div>
    </Window>
  );
}

/** OpenAI platform — Create new secret key modal. */
export function OpenAiCreateKeyMock() {
  const { t } = useTranslation();
  return (
    <Window label="platform.openai.com · Create key">
      <div className="relative bg-[#0d0d0d] p-3 text-[10px] text-[#e3e3e3]">
        <div className="pointer-events-none absolute inset-0 bg-black/50" aria-hidden />
        <div className="relative mx-auto max-w-[17rem] rounded-xl border border-white/15 bg-[#1a1a1a] p-3 shadow-xl">
          <p className="text-[11px] font-semibold">{t("landing.preview.openai.createTitle")}</p>
          <div className="mt-2.5 space-y-2">
            <div>
              <p className="text-[9px] font-medium text-[#8a8a8a]">
                {t("landing.preview.openai.ownedBy")}
              </p>
              <div className="mt-0.5 flex gap-1">
                <span className="rounded-md bg-white px-2 py-0.5 text-[9px] font-semibold text-[#0d0d0d]">
                  {t("landing.preview.openai.you")}
                </span>
                <span className="rounded-md border border-white/15 px-2 py-0.5 text-[9px] text-[#9a9a9a]">
                  {t("landing.preview.openai.serviceAccount")}
                </span>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-medium text-[#8a8a8a]">
                {t("landing.preview.openai.nameOptional")}
              </p>
              <div className="mt-0.5 rounded-md border border-white/15 px-2 py-1 text-[9px] text-[#c4c4c4]">
                {brand.displayName}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-medium text-[#8a8a8a]">
                {t("landing.preview.openai.permissions")}
              </p>
              <div className="mt-0.5 flex gap-1">
                {[
                  t("landing.preview.openai.permsAll"),
                  t("landing.preview.openai.permsRestricted"),
                  t("landing.preview.openai.permsReadOnly"),
                ].map((label, i) => (
                  <span
                    key={label}
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[9px]",
                      i === 0
                        ? "bg-white font-semibold text-[#0d0d0d]"
                        : "border border-white/15 text-[#9a9a9a]",
                    )}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-1.5">
            <span className="rounded-md px-2 py-1 text-[9px] text-[#9a9a9a]">
              {t("landing.preview.openai.cancel")}
            </span>
            <span className="rounded-md bg-white px-2 py-1 text-[9px] font-semibold text-[#0d0d0d]">
              {t("landing.preview.openai.createSecret")}
            </span>
          </div>
          <p className="mt-2 text-[9px] text-[#8a8a8a]">{t("landing.preview.openai.createFootnote")}</p>
        </div>
      </div>
    </Window>
  );
}

/** Resend — API keys list. */
export function ResendKeysMock() {
  const { t } = useTranslation();
  return (
    <Window label="resend.com · API keys">
      <div className="flex overflow-hidden bg-[#0a0a0a] text-[10px] text-[#e5e5e5]">
        <aside className="hidden w-[5.5rem] shrink-0 border-r border-white/10 bg-[#111] p-2 sm:block">
          <p className="mb-2 truncate text-[9px] font-semibold text-[#8a8a8a]">
            {t("landing.preview.resend.workspace")}
          </p>
          {["Emails", "Domains", "API keys"].map((item, i) => (
            <div
              key={item}
              className={cn(
                "mb-0.5 truncate rounded-md px-1.5 py-1",
                i === 2 ? "bg-white/10 text-white" : "text-[#9a9a9a]",
              )}
            >
              {i === 2
                ? t("landing.preview.resend.keysNav")
                : i === 1
                  ? t("landing.preview.resend.domainsNav")
                  : item}
            </div>
          ))}
        </aside>
        <div className="min-w-0 flex-1 p-3">
          <div className="mb-3 flex items-start justify-between gap-2">
            <p className="text-xs font-semibold">{t("landing.preview.resend.keysTitle")}</p>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white px-2 py-1 text-[9px] font-semibold text-[#0a0a0a]">
              <PlusIcon className="size-2.5" aria-hidden />
              {t("landing.preview.resend.createKey")}
            </span>
          </div>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <div className="grid grid-cols-[1fr_1.1fr_0.9fr] gap-2 border-b border-white/10 bg-[#161616] px-2.5 py-1.5 text-[9px] font-medium text-[#8a8a8a] uppercase">
              <span>{t("landing.preview.resend.colName")}</span>
              <span>{t("landing.preview.resend.colToken")}</span>
              <span>{t("landing.preview.resend.colPermission")}</span>
            </div>
            <div className="grid grid-cols-[1fr_1.1fr_0.9fr] items-center gap-2 px-2.5 py-2">
              <span className="truncate font-medium">{t("landing.preview.resend.keyName")}</span>
              <span className="truncate font-mono text-[9px] text-[#8a8a8a]">re_••••••••</span>
              <span className="text-[#c4c4c4]">{t("landing.preview.resend.sendingAccess")}</span>
            </div>
          </div>
          <p className="mt-2 text-[9px] text-[#8a8a8a]">{t("landing.preview.resend.keysFootnote")}</p>
        </div>
      </div>
    </Window>
  );
}

/** Resend — Add API Key modal. */
export function ResendCreateKeyMock() {
  const { t } = useTranslation();
  return (
    <Window label="resend.com · Add API Key">
      <div className="relative bg-[#0a0a0a] p-3 text-[10px] text-[#e5e5e5]">
        <div className="pointer-events-none absolute inset-0 bg-black/50" aria-hidden />
        <div className="relative mx-auto max-w-[16rem] rounded-xl border border-white/15 bg-[#1a1a1a] p-3 shadow-xl">
          <p className="text-[11px] font-semibold">{t("landing.preview.resend.addKeyTitle")}</p>
          <div className="mt-2.5 space-y-2">
            <div>
              <p className="text-[9px] font-medium text-[#8a8a8a]">{t("landing.preview.resend.colName")}</p>
              <div className="mt-0.5 rounded-md border border-white/15 px-2 py-1 text-[9px] text-[#c4c4c4]">
                {brand.displayName}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-medium text-[#8a8a8a]">
                {t("landing.preview.resend.colPermission")}
              </p>
              <div className="mt-0.5 rounded-md border border-white/15 px-2 py-1 text-[9px]">
                {t("landing.preview.resend.fullAccess")}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-medium text-[#8a8a8a]">
                {t("landing.preview.resend.domain")}
              </p>
              <div className="mt-0.5 rounded-md border border-white/15 px-2 py-1 text-[9px]">
                {t("landing.preview.resend.allDomains")}
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-1.5">
            <span className="rounded-md px-2 py-1 text-[9px] text-[#9a9a9a]">
              {t("landing.preview.resend.cancel")}
            </span>
            <span className="rounded-md bg-white px-2 py-1 text-[9px] font-semibold text-[#0a0a0a]">
              {t("landing.preview.resend.add")}
            </span>
          </div>
          <p className="mt-2 text-[9px] text-[#8a8a8a]">{t("landing.preview.resend.createFootnote")}</p>
        </div>
      </div>
    </Window>
  );
}

/** Resend — Domains list. */
export function ResendDomainsMock() {
  const { t } = useTranslation();
  const domains = [
    { name: t("landing.preview.resend.sampleDomain"), primary: true },
    { name: t("landing.preview.resend.sampleDomainAlt"), primary: false },
  ];
  return (
    <Window label="resend.com · Domains">
      <div className="bg-[#0a0a0a] p-3 text-[10px] text-[#e5e5e5]">
        <div className="mb-3 flex items-start justify-between gap-2">
          <p className="text-xs font-semibold">{t("landing.preview.resend.domainsTitle")}</p>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white px-2 py-1 text-[9px] font-semibold text-[#0a0a0a]">
            <PlusIcon className="size-2.5" aria-hidden />
            {t("landing.preview.resend.addDomain")}
          </span>
        </div>
        <div className="overflow-hidden rounded-lg border border-white/10">
          <div className="grid grid-cols-[1.4fr_0.8fr_1fr] gap-2 border-b border-white/10 bg-[#161616] px-2.5 py-1.5 text-[9px] font-medium text-[#8a8a8a] uppercase">
            <span>{t("landing.preview.resend.colDomain")}</span>
            <span>{t("landing.preview.resend.colStatus")}</span>
            <span>{t("landing.preview.resend.colRegion")}</span>
          </div>
          {domains.map((d) => (
            <div
              key={d.name}
              className={cn(
                "grid grid-cols-[1.4fr_0.8fr_1fr] items-center gap-2 border-b border-white/5 px-2.5 py-2 last:border-0",
                d.primary && "bg-emerald-500/5",
              )}
            >
              <div className="flex min-w-0 items-center gap-1.5">
                <GlobeIcon className="size-3 shrink-0 text-emerald-400" aria-hidden />
                <span className="truncate font-medium">{d.name}</span>
              </div>
              <span className="text-[9px] font-medium text-emerald-400">
                {t("landing.preview.resend.verified")}
              </span>
              <span className="truncate text-[9px] text-[#8a8a8a]">
                {t("landing.preview.resend.region")}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[9px] text-[#8a8a8a]">{t("landing.preview.resend.domainsFootnote")}</p>
      </div>
    </Window>
  );
}

/** Resend — domain detail (verified). */
export function ResendDomainDetailMock() {
  const { t } = useTranslation();
  const steps = [
    t("landing.preview.resend.stepAdded"),
    t("landing.preview.resend.stepDns"),
    t("landing.preview.resend.stepVerified"),
  ];
  return (
    <Window label="resend.com · Domain">
      <div className="bg-[#0a0a0a] p-3 text-[10px] text-[#e5e5e5]">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <GlobeIcon className="size-3.5 text-emerald-400" aria-hidden />
          <p className="text-xs font-semibold">{t("landing.preview.resend.sampleDomain")}</p>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-medium text-emerald-400">
            {t("landing.preview.resend.verified")}
          </span>
        </div>
        <div className="mb-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-2 text-[9px] text-emerald-200">
          {t("landing.preview.resend.verifiedBanner")}
        </div>
        <div className="mb-2 flex items-center justify-between gap-1 px-1">
          {steps.map((step, i) => (
            <div key={step} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <span
                className={cn(
                  "size-2 rounded-full",
                  i === 2 ? "bg-emerald-400" : "bg-white/30",
                )}
              />
              <span className="truncate text-center text-[8px] text-[#8a8a8a]">{step}</span>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-[#8a8a8a]">{t("landing.preview.resend.detailFootnote")}</p>
      </div>
    </Window>
  );
}

/** GoDaddy — DNS records (CNAME → Render). */
export function GodaddyDnsMock() {
  const { t } = useTranslation();
  const rows = [
    {
      type: "A",
      name: "@",
      data: "216.24.57.1",
      primary: false,
    },
    {
      type: "CNAME",
      name: t("landing.preview.domain.cnameHost"),
      data: t("landing.preview.domain.onrenderHost"),
      primary: true,
    },
    {
      type: "CNAME",
      name: "www",
      data: t("landing.preview.domain.onrenderHost"),
      primary: false,
    },
  ];
  return (
    <Window label="godaddy.com · DNS">
      <div className="bg-white p-3 text-[10px] text-zinc-800">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold">{t("landing.preview.domain.godaddyTitle")}</p>
            <p className="mt-0.5 truncate text-[9px] text-zinc-500">
              {t("landing.preview.domain.rootDomain")}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-zinc-900 px-2 py-1 text-[9px] font-semibold text-white">
            <PlusIcon className="size-2.5" aria-hidden />
            {t("landing.preview.domain.addRecord")}
          </span>
        </div>
        <div className="mb-2 flex gap-3 border-b border-zinc-200 text-[9px]">
          <span className="border-b-2 border-zinc-900 pb-1.5 font-semibold">
            {t("landing.preview.domain.tabRecords")}
          </span>
          <span className="pb-1.5 text-zinc-400">{t("landing.preview.domain.tabNameservers")}</span>
        </div>
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-[0.6fr_0.7fr_1.4fr] gap-2 border-b border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-[9px] font-medium text-zinc-500 uppercase">
            <span>{t("landing.preview.domain.colType")}</span>
            <span>{t("landing.preview.domain.colName")}</span>
            <span>{t("landing.preview.domain.colData")}</span>
          </div>
          {rows.map((row) => (
            <div
              key={`${row.type}-${row.name}`}
              className={cn(
                "grid grid-cols-[0.6fr_0.7fr_1.4fr] items-center gap-2 border-b border-zinc-100 px-2.5 py-2 last:border-0",
                row.primary && "bg-sky-50",
              )}
            >
              <span className="font-medium">{row.type}</span>
              <span className="truncate font-mono text-[9px]">{row.name}</span>
              <span className="truncate font-mono text-[9px] text-zinc-600">{row.data}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[9px] text-zinc-500">{t("landing.preview.domain.godaddyFootnote")}</p>
      </div>
    </Window>
  );
}

/** Render — Custom Domains list (verified + cert). */
export function RenderCustomDomainsMock() {
  const { t } = useTranslation();
  return (
    <Window label="dashboard.render.com · Custom Domains">
      <div className="bg-[#0d0d0d] p-3 text-[10px] text-[#e3e3e3]">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold">{t("landing.preview.domain.renderTitle")}</p>
            <p className="mt-0.5 text-[9px] text-[#8a8a8a]">
              {t("landing.preview.sample.serviceApp")} · Settings
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-[9px] font-medium">
            <PlusIcon className="size-2.5" aria-hidden />
            {t("landing.preview.domain.addCustom")}
          </span>
        </div>
        <div className="overflow-hidden rounded-lg border border-white/10">
          <div className="grid grid-cols-[1.2fr_0.9fr_1fr] gap-2 border-b border-white/10 bg-[#161616] px-2.5 py-1.5 text-[9px] font-medium text-[#8a8a8a] uppercase">
            <span>{t("landing.preview.domain.colDomain")}</span>
            <span>{t("landing.preview.domain.colVerified")}</span>
            <span>{t("landing.preview.domain.colCert")}</span>
          </div>
          <div className="grid grid-cols-[1.2fr_0.9fr_1fr] items-center gap-2 bg-emerald-500/5 px-2.5 py-2">
            <span className="truncate font-medium">{t("landing.preview.domain.customHost")}</span>
            <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              {t("landing.preview.domain.verified")}
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              {t("landing.preview.domain.certIssued")}
            </span>
          </div>
        </div>
        <div className="mt-2 rounded-lg border border-white/10 bg-[#161616] px-2.5 py-2">
          <p className="text-[9px] font-medium text-[#8a8a8a]">
            {t("landing.preview.domain.renderSubdomain")}
          </p>
          <p className="mt-0.5 truncate font-mono text-[9px] text-[#c4c4c4]">
            https://{t("landing.preview.domain.onrenderHost")}
          </p>
        </div>
      </div>
    </Window>
  );
}

/** Render — Add Custom Domain modal. */
export function RenderAddDomainMock() {
  const { t } = useTranslation();
  return (
    <Window label="dashboard.render.com · Add domain">
      <div className="relative bg-[#0d0d0d] p-3 text-[10px] text-[#e3e3e3]">
        <div className="pointer-events-none absolute inset-0 bg-black/50" aria-hidden />
        <div className="relative mx-auto max-w-[16rem] rounded-xl border border-white/15 bg-[#1a1a1a] p-3 shadow-xl">
          <p className="text-[11px] font-semibold">{t("landing.preview.domain.addModalTitle")}</p>
          <p className="mt-0.5 text-[9px] text-[#8a8a8a]">{t("landing.preview.domain.addModalSubtitle")}</p>
          <div className="mt-2 flex gap-2 text-[8px] text-[#8a8a8a]">
            <span className="font-semibold text-white">{t("landing.preview.domain.step1")}</span>
            <span>→</span>
            <span>{t("landing.preview.domain.step2")}</span>
          </div>
          <div className="mt-2">
            <p className="text-[9px] font-medium text-[#8a8a8a]">
              {t("landing.preview.domain.domainName")}
            </p>
            <div className="mt-0.5 rounded-md border border-white/15 px-2 py-1 font-mono text-[9px] text-[#c4c4c4]">
              {t("landing.preview.domain.customHost")}
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-1.5">
            <span className="rounded-md px-2 py-1 text-[9px] text-[#9a9a9a]">
              {t("landing.preview.domain.cancel")}
            </span>
            <span className="rounded-md bg-white px-2 py-1 text-[9px] font-semibold text-[#0d0d0d]">
              {t("landing.preview.domain.addDomain")}
            </span>
          </div>
        </div>
      </div>
    </Window>
  );
}

/** Render — Custom Domain DNS Records (verified). */
export function RenderDomainDnsMock() {
  const { t } = useTranslation();
  return (
    <Window label="dashboard.render.com · DNS records">
      <div className="relative bg-[#0d0d0d] p-3 text-[10px] text-[#e3e3e3]">
        <div className="pointer-events-none absolute inset-0 bg-black/40" aria-hidden />
        <div className="relative mx-auto max-w-[17rem] rounded-xl border border-white/15 bg-[#1a1a1a] p-3 shadow-xl">
          <p className="text-[11px] font-semibold">{t("landing.preview.domain.dnsModalTitle")}</p>
          <p className="mt-1 truncate font-mono text-[9px] text-[#c4c4c4]">
            {t("landing.preview.domain.customHost")}
          </p>
          <div className="mt-2 space-y-1.5 rounded-lg border border-white/10 bg-[#121212] p-2">
            <div className="flex justify-between gap-2">
              <span className="text-[9px] text-[#8a8a8a]">{t("landing.preview.domain.colType")}</span>
              <span className="font-mono text-[9px]">CNAME</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[9px] text-[#8a8a8a]">{t("landing.preview.domain.hostname")}</span>
              <span className="font-mono text-[9px]">{t("landing.preview.domain.cnameHost")}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[9px] text-[#8a8a8a]">{t("landing.preview.domain.target")}</span>
              <span className="truncate font-mono text-[9px] text-[#a78bfa]">
                {t("landing.preview.domain.onrenderHost")}
              </span>
            </div>
          </div>
          <div className="mt-2 space-y-1 text-[9px] text-emerald-400">
            <p className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              {t("landing.preview.domain.verifiedMsg")}
            </p>
            <p className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              {t("landing.preview.domain.certMsg")}
            </p>
          </div>
        </div>
      </div>
    </Window>
  );
}
