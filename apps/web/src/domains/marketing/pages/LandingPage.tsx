import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  ArrowRightIcon,
  BoxIcon,
  CheckIcon,
  CloudIcon,
  DatabaseIcon,
  EraserIcon,
  FolderTreeIcon,
  LanguagesIcon,
  MoonIcon,
  PaletteIcon,
  PenLineIcon,
  RocketIcon,
  SlidersIcon,
  SunIcon,
  TerminalIcon,
  UnlockIcon,
} from "lucide-react";
import { Button } from "@app/ui/button";
import { Card, CardContent } from "@app/ui/card";
import { useAppConfig } from "@/app/config";
import { useAuth } from "@/domains/auth/context/auth-provider";
import { LOCALES, points, type Locale } from "@/i18n";
import { setLocale } from "@/i18n/locale-controls";
import { ThemeControls } from "@/theme/theme-controls";
import { useTheme } from "@/theme/theme-provider";
import { BrandIcon } from "../components/brand-icon";
import { CodeBlock } from "../components/code-block";
import {
  AccountMock,
  AgentChatMock,
  AuthTables,
  EnvMock,
  flows,
  ImageTables,
  LoginMock,
  McpKeysMock,
  PlansCatalog,
  PlatformTables,
  RenderMock,
  ShellMock,
  TaskTable,
  TasksMock,
  TenantTables,
  TerminalMock,
  UsageTables,
  WindowBar,
  type Screen,
} from "../components/product-preview";

type Included = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

// A single resource, walked top to bottom using the repo's real task domain:
// its folder, the SQL + route, the agent tool, and the screen it powers.
type Slice = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  /** The evidence for this step — a code panel, a mock, or both. */
  visual: ReactNode;
};

const repositoryOutlineFile = `// domains/task/repository.ts — one object, fixed CRUD names
export const taskRepository = {
  async list(tenantId: string): Promise<TaskWithAuthor[]> { /* … */ },
  async find(tenantId: string, id: string): Promise<TaskWithAuthor | null> { /* … */ },
  async insert(values: InsertTask): Promise<Task> { /* … */ },
  async update(tenantId: string, id: string, values: UpdateTask): Promise<Task | null> { /* … */ },
  async delete(tenantId: string, id: string): Promise<boolean> { /* … */ },
};`;

const schemaFile = `/**
 * Tasks
 *
 * One row per task. Scoped to a tenant; optional author (set null on user delete).
 */
export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    completed: boolean("completed").notNull().default(false),
    ...timestamps,
  },
  (t) => [index("tasks_tenant_idx").on(t.tenantId)],
);

export type Task = typeof tasks.$inferSelect;`;

const repositoryMethodFile = `/**
 * List tasks
 *
 * Newest first for the tenant. Query written inline — no shared helpers.
 *
 * @param tenantId - Tenant that owns the tasks
 * @returns Tasks with author names, newest first
 */
async list(tenantId: string): Promise<TaskWithAuthor[]> {
  return db
    .select({ task: tasks, authorName: users.name })
    .from(tasks)
    .leftJoin(users, eq(users.id, tasks.authorId))
    .where(eq(tasks.tenantId, tenantId))
    .orderBy(desc(tasks.createdAt));
}`;

const routeHandlerFile = `/**
 * Create a task
 *
 * \`POST /api/tenants/:tenantId/tasks\`
 *
 * Inserts a task for the current tenant, attributed to the authenticated user.
 *
 * @param c - Authenticated tenant request context
 * @returns 201 with the created task DTO
 */
export async function createTask(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, taskInputSchema);
  const tenant = c.get("tenant");
  const user = c.get("user");

  // -- Processing ------------------------------------------------------------
  const task = await taskRepository.insert({
    tenantId: tenant.id,
    authorId: user.id,
    title: data.title,
    completed: data.completed ?? false,
  });

  // -- Output ----------------------------------------------------------------
  return c.json(toTaskDto({ task, authorName: user.name }), 201);
}`;

const routeMapFile = `// routes/index.ts — auth + tenant middleware once for the group
export const taskRoutes = new Hono<AppEnv>()
  .use("*", requireAuth, requireTenant)
  .get("/", listTasks)
  .post("/", createTask);`;

const toolFile = `/**
 * Create a task
 *
 * \`create_task\`
 *
 * Creates a task in the current tenant for the acting user.
 *
 * @returns \`{ id, title }\` of the created task
 */
export const createTaskTool = defineTool({
  name: "create_task",
  description: "Creates a task in the tenant.",
  inputSchema: {
    title: z.string().trim().min(1).max(200),
    completed: z.boolean().default(false),
  },
  summarize: (args) => \`Task created: \${args.title}\`,
  execute: async (ctx, { title, completed }) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId, userId } = ctx;

    // -- Processing ------------------------------------------------------------
    const task = await taskRepository.insert({
      tenantId,
      authorId: userId,
      title,
      completed,
    });

    // -- Output ----------------------------------------------------------------
    return { id: task.id, title: task.title };
  },
});`;

const toolMapFile = `// tools/index.ts — collect the domain's tools for the agent registry
export const taskTools: AgentTool[] = [
  listTasksTool,
  getTaskTool,
  createTaskTool,
  updateTaskTool,
  setTaskCompletedTool,
  deleteTaskTool,
];

// agent/registry.ts
export const allTools = [...tenantTools, ...taskTools, ...imageTools, ...agentTools];`;

const webApiFile = `// apps/web/src/domains/task/api.ts — the only network boundary
import type { TaskDto } from "@app/shared";
import { api } from "@/lib/api"; // raw HTTP — never called from a page

export const taskApi = {
  list: (tenantId: string) => api.get<TaskDto[]>(\`/tenants/\${tenantId}/tasks\`),
  create: (tenantId: string, body: { title: string; completed?: boolean }) =>
    api.post<TaskDto>(\`/tenants/\${tenantId}/tasks\`, body),
  update: (tenantId: string, id: string, body: { title: string; completed?: boolean }) =>
    api.patch<TaskDto>(\`/tenants/\${tenantId}/tasks/\${id}\`, body),
  delete: (tenantId: string, id: string) =>
    api.delete(\`/tenants/\${tenantId}/tasks/\${id}\`),
};`;

const webRoutesFile = `// domains/task/routes.tsx — the domain owns its <Route>
export const taskRoutes = <Route path="tasks" element={<TasksPage />} />;

// domains/tenant/routes.tsx — composes every domain under :tenantSlug
export const tenantRoutes = (
  <Route path="/app" element={<RequireAuth />}>
    <Route path=":tenantSlug" element={<AppLayout />}>
      <Route index element={<DashboardPage />} />
      {taskRoutes}      {/* ← drop a new domain's routes here */}
      {imageRoutes}
      {billingRoutes}
      {accountRoutes}
    </Route>
  </Route>
);`;

const pageFile = `// pages/TasksPage.tsx — the canonical page template (copy this shape)
export function TasksPage() {
  // Tenant comes from context (TenantProvider), never from parsing the URL here.
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  // Reads are queries, keyed by the tenant.
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", tenant.id],
    queryFn: () => taskApi.list(tenant.id),
  });

  // Writes are mutations that invalidate on success — no manual loading flags.
  const create = useMutation({
    mutationFn: (title: string) => taskApi.create(tenant.id, { title }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", tenant.id] }),
    onError: (err) => showApiError(err, "Failed to add task"),
  });

  if (isLoading) return <PageLoading />;
  if (!tasks?.length) return <EmptyState>No tasks yet</EmptyState>;
  // …list UI from @app/ui; delete goes through useConfirm()
  return <PageHeader title="Tasks" description="Example resource" />;
}`;

const webTreeFile = `// Same domain name on the web — fixed roles, optional folders.
apps/web/src/domains/task/
├── api.ts           typed HTTP — the only network boundary
├── pages/           route screens (TasksPage.tsx, PascalCase)
├── routes.tsx       the domain's <Route>; composed under :tenantSlug
└── components/      domain UI (kebab-case) — add with the first one

// When the domain needs shared React state:
//   context/<name>-provider.tsx   Provider + useX (auth, tenant, …)
//   hooks/                        reusable hooks that aren't just useX

// Outside domains (shared shell, not product features):
//   app/          App.tsx route map, config.ts
//   layouts/      AppLayout, AuthLayout, RequireAuth
//   theme/ · i18n/ · lib/
//
// Base UI is @app/ui (Button, Card, PageHeader, EmptyState, useConfirm).
// No top-level src/components/ — product UI stays in the owning domain.`;

const domainMapFile = `// Domain-driven: one feature = one folder on BOTH sides.
// Same name. Fixed roles. Shared contract in packages/shared.

apps/api/src/domains/task/              apps/web/src/domains/task/
├── schema.ts        table              ├── api.ts        typed HTTP
├── repository.ts    all SQL            ├── pages/        route screens
├── dto.ts           row → DTO          ├── routes.tsx    <Route> element
├── routes/          HTTP handlers      └── components/   domain UI (as needed)
└── tools/           agent tools

packages/shared/src/task.ts
└── Zod input schema + TaskDto — imported by API and web

// Cross-cutting React state (not every domain needs this):
//   auth/context/     AuthProvider + useAuth
//   tenant/context/   TenantProvider + useTenant  ← pages read tenant here
//
// Base UI (@app/ui) is tenant-agnostic. Domains compose it; they don't reinvent it.`;

type Chapter = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  /** A single static mock… */
  mock?: ComponentType;
  /** …or a multi-screen flow that keeps the browser chrome fixed and swaps the body. */
  flow?: Screen[];
};

type Foundation = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  /** The evidence for this pillar: a schema map, a terminal, a Render panel. */
  visual: ReactNode;
};

type DbGroup = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  visual: ReactNode;
};

const repoTreeFile = `app-base/
├── apps/
│   ├── api/          Hono + Drizzle + Postgres
│   └── web/          React + Vite SPA
├── packages/
│   └── shared/       Zod schemas + DTOs (both sides)
├── .cursor/rules/    conventions the AI follows
├── render.yaml       one-service deploy
└── turbo.json        task graph`;

const mediaStoreFile = `// lib/media-store.ts — the one interface any domain touches for files
export interface MediaStore {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  has(key: string): Promise<boolean>;
  remove(key: string): Promise<void>;
}

// domains/images/media.ts — the backend is picked once, at boot
export const mediaStore: MediaStore = env.r2.endpoint
  ? r2Store    // integrations/r2.ts — Cloudflare R2, public URL
  : localStore; // disk — dev only, Render's disk is ephemeral

export async function writeMedia(key: string, data: Buffer) {
  const compressed = await compressImage(data); // sharp → WebP
  await mediaStore.put(key, compressed);
}`;

const themeFile = `// src/theme/themes.ts — add your brand in one block
export const themes: Theme[] = [
  {
    id: "violet",
    label: "Violet",
    swatch: "oklch(0.55 0.22 295)",
    light: {
      ...lightBase,                        // neutral surfaces
      "--primary": "oklch(0.55 0.22 295)", // buttons, highlights
      "--primary-foreground": "oklch(0.985 0 0)",
    },
    dark: {
      ...darkBase,
      "--primary": "oklch(0.68 0.19 295)", // lifted for dark bg
      "--primary-foreground": "oklch(0.145 0 0)",
    },
  },
];`;

/** Locale key under `landing.slices.*` (camelCase for multi-word keys). */
type SliceLocaleKey =
  | "convention"
  | "schema"
  | "schemaFile"
  | "repository"
  | "repositoryMethod"
  | "route"
  | "routeMap"
  | "tool"
  | "toolMap"
  | "webConvention"
  | "api"
  | "webRoutes"
  | "page"
  | "screen";

function sliceCopy(localeKey: SliceLocaleKey, t: TFunction) {
  return {
    eyebrow: t(`landing.slices.${localeKey}.eyebrow`),
    title: t(`landing.slices.${localeKey}.title`),
    body: t(`landing.slices.${localeKey}.body`),
    points: points(t, `landing.slices.${localeKey}.points`),
  };
}

function pillarCopy(key: "monorepo" | "config" | "storage" | "localRun" | "render", t: TFunction) {
  return {
    eyebrow: t(`landing.${key}.eyebrow`),
    title: t(`landing.${key}.title`),
    body: t(`landing.${key}.body`),
    points: points(t, `landing.${key}.points`),
  };
}

function dbGroupCopy(
  key: "identity" | "tenancy" | "billing" | "usage" | "images" | "platform",
  t: TFunction,
) {
  return {
    eyebrow: t(`landing.db.${key}.eyebrow`),
    title: t(`landing.db.${key}.title`),
    body: t(`landing.db.${key}.body`),
    points: points(t, `landing.db.${key}.points`),
  };
}

function chapterCopy(
  key:
    | "signIn"
    | "signUp"
    | "recovery"
    | "shell"
    | "agent"
    | "account"
    | "team"
    | "admin"
    | "plans"
    | "mcp",
  t: TFunction,
) {
  return {
    eyebrow: t(`landing.chapters.${key}.eyebrow`),
    title: t(`landing.chapters.${key}.title`),
    body: t(`landing.chapters.${key}.body`),
  };
}

// One visual per step: domain map → API files → web files → the screen.
// tasks is the placeholder resource you'd copy end to end for your own.
function buildResourceSlices(t: TFunction): Slice[] {
  return [
    {
      id: "convention",
      ...sliceCopy("convention", t),
      visual: <CodeBlock filename="domains/task/" code={domainMapFile} lang="text" />,
    },
    {
      id: "schema",
      ...sliceCopy("schema", t),
      visual: <TaskTable />,
    },
    {
      id: "schema-file",
      ...sliceCopy("schemaFile", t),
      visual: <CodeBlock filename="domains/task/schema.ts" code={schemaFile} lang="ts" />,
    },
    {
      id: "repository",
      ...sliceCopy("repository", t),
      visual: (
        <CodeBlock filename="domains/task/repository.ts" code={repositoryOutlineFile} lang="ts" />
      ),
    },
    {
      id: "repository-method",
      ...sliceCopy("repositoryMethod", t),
      visual: (
        <CodeBlock
          filename="domains/task/repository.ts → list"
          code={repositoryMethodFile}
          lang="ts"
        />
      ),
    },
    {
      id: "route",
      ...sliceCopy("route", t),
      visual: (
        <CodeBlock
          filename="domains/task/routes/create-task.route.ts"
          code={routeHandlerFile}
          lang="ts"
        />
      ),
    },
    {
      id: "route-map",
      ...sliceCopy("routeMap", t),
      visual: <CodeBlock filename="domains/task/routes/index.ts" code={routeMapFile} lang="ts" />,
    },
    {
      id: "tool",
      ...sliceCopy("tool", t),
      visual: (
        <CodeBlock filename="domains/task/tools/create-task.tool.ts" code={toolFile} lang="ts" />
      ),
    },
    {
      id: "tool-map",
      ...sliceCopy("toolMap", t),
      visual: (
        <CodeBlock filename="domains/task/tools/index.ts" code={toolMapFile} lang="ts" />
      ),
    },
    {
      id: "web-convention",
      ...sliceCopy("webConvention", t),
      visual: <CodeBlock filename="apps/web/src/domains/task/" code={webTreeFile} lang="text" />,
    },
    {
      id: "api",
      ...sliceCopy("api", t),
      visual: <CodeBlock filename="apps/web/src/domains/task/api.ts" code={webApiFile} lang="ts" />,
    },
    {
      id: "web-routes",
      ...sliceCopy("webRoutes", t),
      visual: (
        <CodeBlock filename="apps/web/src/domains/task/routes.tsx" code={webRoutesFile} lang="ts" />
      ),
    },
    {
      id: "page",
      ...sliceCopy("page", t),
      visual: (
        <CodeBlock
          filename="apps/web/src/domains/task/pages/TasksPage.tsx"
          code={pageFile}
          lang="ts"
        />
      ),
    },
    {
      id: "screen",
      ...sliceCopy("screen", t),
      visual: <TasksMock />,
    },
  ];
}

// The product tour as a flow: land, sign up, recover, then step into the
// workspace and each thing it ships with. Emails hang off the flow that sends
// them rather than standing alone.
function buildChapters(t: TFunction): Chapter[] {
  return [
    { id: "signIn", ...chapterCopy("signIn", t), mock: LoginMock },
    { id: "signUp", ...chapterCopy("signUp", t), flow: flows.register },
    { id: "recovery", ...chapterCopy("recovery", t), flow: flows.recovery },
    { id: "shell", ...chapterCopy("shell", t), mock: ShellMock },
    { id: "agent", ...chapterCopy("agent", t), mock: AgentChatMock },
    { id: "account", ...chapterCopy("account", t), mock: AccountMock },
    { id: "team", ...chapterCopy("team", t), flow: flows.invite },
    { id: "admin", ...chapterCopy("admin", t), flow: flows.admin },
    { id: "plans", ...chapterCopy("plans", t), flow: flows.plans },
    { id: "mcp", ...chapterCopy("mcp", t), mock: McpKeysMock },
  ];
}

function buildDbGroups(t: TFunction): DbGroup[] {
  return [
    {
      id: "identity",
      ...dbGroupCopy("identity", t),
      visual: <AuthTables />,
    },
    {
      id: "tenancy",
      ...dbGroupCopy("tenancy", t),
      visual: <TenantTables />,
    },
    {
      id: "billing",
      ...dbGroupCopy("billing", t),
      visual: <PlansCatalog />,
    },
    {
      id: "usage",
      ...dbGroupCopy("usage", t),
      visual: <UsageTables />,
    },
    {
      id: "images",
      ...dbGroupCopy("images", t),
      visual: <ImageTables />,
    },
    {
      id: "platform",
      ...dbGroupCopy("platform", t),
      visual: <PlatformTables />,
    },
  ];
}

function buildMonorepoPillar(t: TFunction): Foundation {
  return {
    id: "monorepo",
    icon: FolderTreeIcon,
    ...pillarCopy("monorepo", t),
    visual: <CodeBlock filename="app-base" code={repoTreeFile} lang="text" />,
  };
}

function buildFoundations(t: TFunction): Foundation[] {
  return [
    {
      id: "config",
      icon: SlidersIcon,
      ...pillarCopy("config", t),
      visual: <EnvMock />,
    },
    {
      id: "storage",
      icon: CloudIcon,
      ...pillarCopy("storage", t),
      visual: <CodeBlock filename="lib/media-store.ts" code={mediaStoreFile} lang="ts" />,
    },
    {
      id: "localRun",
      icon: TerminalIcon,
      ...pillarCopy("localRun", t),
      visual: <TerminalMock />,
    },
  ];
}

function buildRenderPillar(t: TFunction): Foundation {
  return {
    id: "render",
    icon: RocketIcon,
    ...pillarCopy("render", t),
    visual: <RenderMock />,
  };
}

function buildOwnership(t: TFunction): Included[] {
  return [
    {
      icon: EraserIcon,
      title: t("landing.ownership.delete.title"),
      description: t("landing.ownership.delete.description"),
    },
    {
      icon: UnlockIcon,
      title: t("landing.ownership.unsubscribe.title"),
      description: t("landing.ownership.unsubscribe.description"),
    },
    {
      icon: PenLineIcon,
      title: t("landing.ownership.rules.title"),
      description: t("landing.ownership.rules.description"),
    },
  ];
}

const stackItems: {
  labelKey: "frontend" | "backend" | "database" | "ai" | "tooling";
  items: string[];
}[] = [
  { labelKey: "frontend", items: ["React 19", "Vite", "Tailwind", "shadcn/ui", "TanStack Query"] },
  { labelKey: "backend", items: ["Hono", "Zod", "Node"] },
  { labelKey: "database", items: ["PostgreSQL", "Drizzle ORM"] },
  { labelKey: "ai", items: ["OpenAI", "Model Context Protocol (MCP)"] },
  { labelKey: "tooling", items: ["TypeScript", "Turborepo", "oxlint", "Prettier"] },
];

export function LandingPage() {
  const { t, i18n } = useTranslation();
  const { me } = useAuth();
  const { selfSignupEnabled } = useAppConfig();
  useReveal();

  const lang = i18n.language;
  const monorepoPillar = useMemo(() => buildMonorepoPillar(t), [t, lang]);
  const foundations = useMemo(() => buildFoundations(t), [t, lang]);
  const chapters = useMemo(() => buildChapters(t), [t, lang]);
  const renderPillar = useMemo(() => buildRenderPillar(t), [t, lang]);
  const ownership = useMemo(() => buildOwnership(t), [t, lang]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <BoxIcon className="size-5 text-primary" />
            {t("brand")}
          </Link>
          <nav className="flex items-center gap-2">
            <ThemeControls className="mr-1" />
            {me ? (
              <Button asChild>
                <Link to="/app">
                  {t("landing.goToApp")} <ArrowRightIcon />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">{t("landing.signIn")}</Link>
                </Button>
                {selfSignupEnabled && (
                  <Button asChild>
                    <Link to="/register">{t("landing.tryDemo")}</Link>
                  </Button>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-5xl px-4 py-24 text-center sm:py-32">
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            {t("landing.hero.eyebrow")}
          </p>
          <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {t("landing.hero.title")}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
            {t("landing.hero.body")}
          </p>
          <div className="mx-auto mt-8 flex w-fit max-w-full items-center gap-2 overflow-x-auto rounded-lg border bg-muted/50 px-4 py-3 font-mono text-sm">
            <TerminalIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">$</span>
            <span className="whitespace-nowrap">git clone https://github.com/fecruzb/app</span>
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" asChild>
              <Link to={me ? "/app" : selfSignupEnabled ? "/register" : "/login"}>
                {me ? t("landing.goToApp") : t("landing.tryLiveDemo")} <ArrowRightIcon />
              </Link>
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/40 px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                {t("landing.stackSection.title")}
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
                {t("landing.stackSection.body")}
              </p>
            </div>
            <div className="mx-auto mt-8 max-w-2xl divide-y rounded-lg border bg-background">
              {stackItems.map((s) => (
                <div
                  key={s.labelKey}
                  className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:gap-6"
                >
                  <p className="w-24 shrink-0 text-sm font-medium">
                    {t(`landing.stack.${s.labelKey}`)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {s.items.map((item) => (
                      <span
                        key={item}
                        className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1 text-xs font-medium"
                      >
                        <BrandIcon name={item} className="size-3.5" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/40 px-4 pt-20 pb-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">
              {t("landing.foundationsIntro.eyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              {t("landing.foundationsIntro.title")}
            </h2>
            <p className="mx-auto mt-3 text-pretty text-muted-foreground">
              {t("landing.foundationsIntro.body")}
            </p>
          </div>
        </section>

        <div className="bg-muted/40">
          <FoundationSection pillar={monorepoPillar} flip={false} />
          <DatabaseFoundation />
          <ResourceSlice />
          {foundations.map((pillar, i) => (
            <FoundationSection key={pillar.id} pillar={pillar} flip={i % 2 === 1} />
          ))}
          <ThemingSection />
          <I18nSection />
        </div>

        <section className="border-t px-4 pt-20 pb-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">{t("landing.tourIntro.eyebrow")}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              {t("landing.tourIntro.title")}
            </h2>
            <p className="mx-auto mt-3 text-pretty text-muted-foreground">
              {t("landing.tourIntro.body")}
            </p>
          </div>
        </section>

        {chapters.map((chapter, i) => (
          <ChapterSection key={chapter.id} chapter={chapter} flip={i % 2 === 1} />
        ))}

        <FoundationSection pillar={renderPillar} flip={false} />

        <section className="border-t px-4 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              {t("landing.closing.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
              {t("landing.closing.body")}
            </p>
            <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
              {ownership.map((item) => (
                <Card key={item.title} className="reveal">
                  <CardContent className="p-5">
                    <item.icon className="mb-3 size-5 text-primary" />
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button size="lg" className="mt-10" asChild>
              <Link to={me ? "/app" : selfSignupEnabled ? "/register" : "/login"}>
                {me ? t("landing.goToApp") : t("landing.tryLiveDemo")} <ArrowRightIcon />
              </Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">{t("landing.closing.skipDemo")}</p>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 text-sm text-muted-foreground">
          <span>{t("landing.footer.copyright", { year: new Date().getFullYear() })}</span>
          <span>{t("landing.footer.builtWith")}</span>
        </div>
      </footer>
    </div>
  );
}

const i18nFile = `// locales/en.json  ·  locales/pt.json — same keys
{
  "tasks": { "title": "Tasks" }    // EN
  "tasks": { "title": "Tarefas" }  // PT
}

// Any component — no wiring beyond useTranslation
const { t } = useTranslation();
return <PageHeader title={t("tasks.title")} />;`;

/**
 * Live i18n demo — the language buttons drive the real i18n instance, so the
 * whole landing (and this section) switch language in place.
 */
function I18nSection() {
  const { t, i18n } = useTranslation();
  const current = (
    LOCALES.includes(i18n.language as Locale)
      ? i18n.language
      : i18n.language.startsWith("pt")
        ? "pt"
        : "en"
  ) as Locale;
  const bullets = points(t, "landing.i18n.points");

  return (
    <section className="border-t px-4 py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="reveal reveal-delay min-w-0 lg:order-1">
          <CodeBlock filename="apps/web/src/i18n/" code={i18nFile} lang="ts" />
        </div>

        <div className="reveal lg:order-2">
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <LanguagesIcon className="size-4" /> {t("landing.i18n.eyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {t("landing.i18n.title")}
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">{t("landing.i18n.body")}</p>
          <ul className="mt-6 space-y-3 text-sm">
            {bullets.map((point) => (
              <li key={point} className="flex gap-2.5">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {t("landing.i18n.language")}
              </p>
              <div className="inline-flex rounded-lg border p-1">
                {LOCALES.map((locale) => (
                  <button
                    key={locale}
                    type="button"
                    onClick={() => setLocale(locale)}
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                      locale === current
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {t(`languages.${locale}`)}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t("landing.i18n.tryIt")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Live theming demo — the swatches and toggle drive the real ThemeProvider, so
 * clicking one recolors this entire page. The code panel is the actual file you
 * edit to add your own theme.
 */
function ThemingSection() {
  const { t } = useTranslation();
  const { themes, themeId, setTheme, mode, setMode } = useTheme();

  return (
    <section className="border-t px-4 py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="reveal">
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <PaletteIcon className="size-4" /> {t("landing.theming.eyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {t("landing.theming.title")}
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            {t("landing.theming.bodyBefore")}
            <code className="font-mono text-xs">{t("landing.theming.bodyCode")}</code>
            {t("landing.theming.bodyAfter")}
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {t("landing.theming.primaryColor")}
              </p>
              <div className="flex flex-wrap gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setTheme(theme.id)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      theme.id === themeId
                        ? "border-primary bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <span
                      className="size-3.5 rounded-full border"
                      style={{ backgroundColor: theme.swatch }}
                    />
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {t("landing.theming.mode")}
              </p>
              <div className="inline-flex rounded-lg border p-1">
                <button
                  onClick={() => setMode("light")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    mode === "light"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <SunIcon className="size-4" /> {t("landing.theming.light")}
                </button>
                <button
                  onClick={() => setMode("dark")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    mode === "dark" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  <MoonIcon className="size-4" /> {t("landing.theming.dark")}
                </button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{t("landing.theming.tryIt")}</p>
          </div>
        </div>

        <div className="reveal reveal-delay min-w-0">
          <CodeBlock filename="src/theme/themes.ts" code={themeFile} lang="ts" />
        </div>
      </div>
    </section>
  );
}

/**
 * One foundation pillar: copy + bullets on one side, a faithful visual on the
 * other, alternating sides down the page. No sticky columns — both sides are
 * equal-weight and top-aligned so the rhythm reads as a single narrative.
 */
function FoundationSection({ pillar, flip }: { pillar: Foundation; flip: boolean }) {
  const Icon = pillar.icon;
  return (
    <section className="border-t px-4 py-16 sm:py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className={`reveal min-w-0 ${flip ? "lg:order-2" : ""}`}>
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <Icon className="size-4" /> {pillar.eyebrow}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {pillar.title}
          </h3>
          <p className="mt-4 text-pretty text-muted-foreground">{pillar.body}</p>
          <ul className="mt-6 space-y-3 text-sm">
            {pillar.points.map((point) => (
              <li key={point} className="flex gap-2.5">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`reveal reveal-delay min-w-0 ${flip ? "lg:order-1" : ""}`}>
          {pillar.visual}
        </div>
      </div>
    </section>
  );
}

/**
 * The database pillar, told one domain at a time: an intro, then a subsection
 * per group (identity, tenancy, your resources) that explains its tables while
 * showing only those tables. Alternating sides keep it from feeling like a wall.
 */
function DatabaseFoundation() {
  const { t, i18n } = useTranslation();
  const dbGroups = useMemo(() => buildDbGroups(t), [t, i18n.language]);

  return (
    <>
      <section className="border-t px-4 pt-16 pb-4 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
            <DatabaseIcon className="size-4" /> {t("landing.database.eyebrow")}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {t("landing.database.title")}
          </h3>
          <p className="mx-auto mt-3 text-pretty text-muted-foreground">
            {t("landing.database.bodyBefore")}
            <code className="font-mono text-xs">{t("landing.database.bodyCode")}</code>
            {t("landing.database.bodyAfter")}
          </p>
        </div>
      </section>

      {dbGroups.map((group, i) => (
        <DbGroupSection key={group.id} group={group} flip={i % 2 === 1} />
      ))}
    </>
  );
}

function DbGroupSection({ group, flip }: { group: DbGroup; flip: boolean }) {
  return (
    <section className="px-4 py-8 sm:py-10">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className={`reveal min-w-0 ${flip ? "lg:order-2" : ""}`}>
          <p className="text-sm font-medium text-primary">{group.eyebrow}</p>
          <h4 className="mt-1.5 text-xl font-semibold tracking-tight text-balance sm:text-2xl">
            {group.title}
          </h4>
          <p className="mt-3 text-pretty text-muted-foreground">{group.body}</p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {group.points.map((point) => (
              <li key={point} className="flex gap-2.5">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`reveal reveal-delay min-w-0 ${flip ? "lg:order-1" : ""}`}>
          {group.visual}
        </div>
      </div>
    </section>
  );
}

/**
 * The example resource walked end to end: the table opened it in the database
 * section, and this closes the loop — repository + route, the agent tool,
 * and the screen — all from the repo's real task domain, alternating sides.
 */
function ResourceSlice() {
  const { t, i18n } = useTranslation();
  const resourceSlices = useMemo(() => buildResourceSlices(t), [t, i18n.language]);

  return (
    <>
      <section className="border-t px-4 pt-16 pb-4 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
            <FolderTreeIcon className="size-4" /> {t("landing.resourceIntro.eyebrow")}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {t("landing.resourceIntro.title")}
          </h3>
          <p className="mx-auto mt-3 text-pretty text-muted-foreground">
            {t("landing.resourceIntro.bodyBefore")}
            <code className="font-mono text-xs">{t("landing.resourceIntro.bodyCode")}</code>
            {t("landing.resourceIntro.bodyAfter")}
          </p>
        </div>
      </section>

      {resourceSlices.map((slice, i) => (
        <DbGroupSection
          key={slice.id}
          group={{
            id: slice.id,
            eyebrow: slice.eyebrow,
            title: slice.title,
            body: slice.body,
            points: slice.points,
            visual: slice.visual,
          }}
          flip={i % 2 === 1}
        />
      ))}
    </>
  );
}

/** One product-tour chapter: copy on one side, its mock (plus any email) on the other. */
function ChapterSection({ chapter, flip }: { chapter: Chapter; flip: boolean }) {
  return (
    <section className="px-4 py-10 sm:py-12">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className={`reveal ${flip ? "lg:order-2" : ""}`}>
          <p className="text-sm font-medium text-primary">{chapter.eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {chapter.title}
          </h3>
          <p className="mt-4 text-pretty text-muted-foreground">{chapter.body}</p>
        </div>
        <div className={`reveal reveal-delay min-w-0 ${flip ? "lg:order-1" : ""}`}>
          <MockCarousel chapter={chapter} />
        </div>
      </div>
    </section>
  );
}

/**
 * A single-mock chapter renders its mock as-is. A flow chapter keeps the browser
 * chrome (frame + bar) fixed and only crossfades the body inside on a timer, so
 * alternating between screens never resizes the frame or jumps the layout.
 */
function MockCarousel({ chapter }: { chapter: Chapter }) {
  const { t } = useTranslation();
  const screens = chapter.flow;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!screens || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % screens.length), 3500);
    return () => clearInterval(id);
  }, [screens, paused]);

  if (!screens) {
    const Only = chapter.mock!;
    return <Only />;
  }

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <WindowBar label={screens[index].label} />
        {/* Bodies share one grid cell: the tallest sets a fixed height, they crossfade in place. */}
        <div className="grid w-full grid-cols-1">
          {screens.map((screen, i) => {
            const Body = screen.Body;
            return (
              <div
                key={i}
                aria-hidden={i !== index}
                className={`col-start-1 row-start-1 min-w-0 transition-opacity duration-500 ${
                  i === index ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <Body />
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        {screens.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={t("landing.showScreen", { n: i + 1 })}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/** Fade sections in as they enter the viewport — no animation library. */
function useReveal(): void {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)");
    if (!nodes.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );
    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, []);
}
