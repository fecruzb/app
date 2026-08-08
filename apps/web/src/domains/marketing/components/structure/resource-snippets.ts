/**
 * Code snippets shown in the resource walk — mirror real repo conventions.
 * If a convention changes, update the matching snippet here.
 */
import { brand } from "@app/shared";

export const repositoryOutlineFile = `// domains/task/repository.ts — one object, fixed CRUD names
export const taskRepository = {
  async list(tenantId: string, search?: string): Promise<TaskWithAuthor[]> { /* … */ },
  async find(tenantId: string, taskId: string): Promise<TaskWithAuthor | null> { /* … */ },
  async insert(values: {
    tenantId: string;
    authorId: string | null;
    title: string;
    completed: boolean;
  }): Promise<Task> { /* … */ },
  async update(
    tenantId: string,
    taskId: string,
    values: { title: string; completed: boolean },
  ): Promise<Task | null> { /* … */ },
  async delete(tenantId: string, taskId: string): Promise<Task | null> { /* … */ },
};`;

export const dtoFile = `// domains/task/dto.ts — map DB rows to the shared DTO (never spread a row)
import type { TaskDto } from "@app/shared";
import type { TaskWithAuthor } from "./repository";

export function toTaskDto({ task, authorName }: TaskWithAuthor): TaskDto {
  return {
    id: task.id,
    title: task.title,
    completed: task.completed,
    authorId: task.authorId,
    authorName,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}`;

export const schemaFile = `/** Tasks — one row per task, tenant-scoped */
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

export const repositoryMethodFile = `/** List tasks — tenant-scoped, newest first */
async list(tenantId: string, search?: string): Promise<TaskWithAuthor[]> {
  const where = search
    ? and(eq(tasks.tenantId, tenantId), ilike(tasks.title, \`%\${search}%\`))
    : eq(tasks.tenantId, tenantId);
  return db
    .select({ task: tasks, authorName: users.name })
    .from(tasks)
    .leftJoin(users, eq(users.id, tasks.authorId))
    .where(where)
    .orderBy(desc(tasks.createdAt));
}`;

export const routeHandlerFile = `// routes/task.post.route.ts — POST /api/tenants/:tenantId/tasks
/** Create a task — 201 + task DTO */
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

export const routeMapFile = `// routes/index.ts — auth + tenant middleware once for the group
export const taskRoutes = new Hono<AppEnv>()
  .use("*", requireAuth, requireTenant)
  .get("/", listTasks)
  .post("/", createTask)
  .get("/:taskId", getTask)
  .patch("/:taskId", updateTask)
  .delete("/:taskId", deleteTask);`;

export const toolFile = `// tools/create-task.tool.ts — one file teaches the assistant
export const createTaskTool = defineTool({
  name: "create_task",
  description: "Creates a task in the tenant.",
  inputSchema: {
    title: taskInputSchema.shape.title,
    completed: z.boolean().default(false),
  },
  progress: (args) => \`Creating task: \${args.title}\`,
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

export const toolMapFile = `// tools/index.ts — collect the domain's tools for the agent registry
export const taskTools: AgentTool[] = [
  listTasksTool,
  getTaskTool,
  createTaskTool,
  updateTaskTool,
  setTaskCompletedTool,
  deleteTaskTool,
];

// agent/registry.ts
export const allTools = [...tenantTools, ...taskTools, ...articleTools, ...agentTools];`;

export const webApiFile = `// apps/web/src/domains/task/api.ts — the only network boundary
import type { z } from "zod";
import { taskInputSchema, type TaskDto } from "@app/shared";
import { api } from "@/lib/api"; // raw HTTP — never called from a page

export const taskApi = {
  list: (tenantId: string, search?: string) => {
    const q = search?.trim() ? \`?search=\${encodeURIComponent(search.trim())}\` : "";
    return api.get<TaskDto[]>(\`/tenants/\${tenantId}/tasks\${q}\`);
  },
  create: (tenantId: string, body: z.infer<typeof taskInputSchema>) =>
    api.post<TaskDto>(\`/tenants/\${tenantId}/tasks\`, body),
  update: (tenantId: string, id: string, body: z.infer<typeof taskInputSchema>) =>
    api.patch<TaskDto>(\`/tenants/\${tenantId}/tasks/\${id}\`, body),
  delete: (tenantId: string, id: string) =>
    api.delete(\`/tenants/\${tenantId}/tasks/\${id}\`),
};`;

/** Zoom-in: one method from the domain api object. */
export const webApiMethodFile = `/** List tasks — path mirrors /api/tenants/:tenantId/tasks */
list: (tenantId: string, search?: string) => {
  const q = search?.trim() ? \`?search=\${encodeURIComponent(search.trim())}\` : "";
  return api.get<TaskDto[]>(\`/tenants/\${tenantId}/tasks\${q}\`);
}`;

export const webAppMountFile = `// app/App.tsx — compose top-level route groups once
export function App() {
  return (
    <Routes>
      {marketingRoutes}
      {authRoutes}
      {joinRoutes}
      {adminRoutes}
      {tenantRoutes}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}`;

export const webLibApiFile = `// lib/api.ts — raw HTTP only (no domain knowledge)
export class ApiError extends Error { /* status + message */ }

export function showApiError(err: unknown, fallback: string): void { /* toast */ }

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T = void>(path: string) => request<T>(path, { method: "DELETE" }),
};

// Pages import ApiError / showApiError — never api.get from a page.`;

export const webLayoutsFile = `// layouts/RequireAuth.tsx — gate the outlet
export function RequireAuth() {
  const { me, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner />;
  if (!me) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
}

// AppLayout = SidebarShell + nav items · AuthLayout = AuthShell`;

export const webContextFile = `// context/tenant-provider.tsx — Provider + useTenant together
export function TenantProvider({ children }: { children: ReactNode }) {
  const { me } = useAuth();
  const { tenantSlug } = useParams();
  const tenant = me?.tenants.find((t) => t.slug === tenantSlug) ?? null;

  if (!tenant) return <Navigate to="/app" replace />;

  return (
    <TenantContext.Provider
      value={{ tenant, isManager: managerRoles.includes(tenant.role) }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue { /* … */ }
// Pages read tenant here — never parse the URL themselves.`;

export const webHooksFile = `// hooks/use-audio-recorder.ts — React helper (not the context consumer)
export function useAudioRecorder({ onAudio, onError }: Options) {
  const [recording, setRecording] = useState(false);
  // getUserMedia + MediaRecorder → Blob for the caller
  return { recording, start, stop, cancel };
}

// Context consumers (useAuth / useTenant) stay next to their Provider.
// Non-React helpers with logic → utils/; statics → constants/.`;

export const webComponentFile = `// components/role-select.tsx — domain UI, kebab-case
export function RoleSelect({ value, onChange, includeOwner }: Props) {
  const { t } = useTranslation();
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as TenantRole)}>
      {includeOwner && <option value="owner">{t("roles.owner")}</option>}
      <option value="admin">{t("roles.admin")}</option>
      <option value="member">{t("roles.member")}</option>
    </select>
  );
}

// Base UI from @app/ui — product UI stays in the owning domain.`;

export const webConstantsSnippet = `// constants/<topic>.constants.ts — static values only (optional folder)
export const LAST_TENANT_KEY = "app:lastTenant";

// Same role as the API: catalogs · keys · limits. No helpers.
// Create the folder with the first file — never empty.`;

export const webUtilsSnippet = `// utils/<topic>.utils.ts — non-React helpers with logic (optional)
export function formatInviteLabel(email: string, role: TenantRole): string {
  return \`\${email} · \${role}\`;
}

// React helpers → hooks/. App-root lib/ stays cross-cutting infra.`;

export const webI18nFile = `// i18n/ — UI copy, never hardcoded in JSX
// locales/en.json + pt.json           → app shell
// locales/landing.en.json + .pt.json  → public landing

const { t } = useTranslation();
t("tasks.title");
t("landing.moduleZoom.web.title");

// Add every new string to both files of the matching pair.`;

export const webThemeFile = `// theme/theme-controls.tsx — product wiring only
// language · palette · mode (uses useTheme from @app/ui/theme)

// ThemeProvider + tokens live in @app/ui/theme — not here.
// Components use CSS variables — never hardcode colors.`;

export const webBrandFile = `// brand/logo.tsx → AppLogo (+ logo.css for motion)
<Brand icon={<AppLogo />}>{t("brand")}</Brand>

// Display name / MCP id → @app/shared brand
// Favicon + static mark → apps/web/public/brand/`;

export const webRoutesFile = `// domains/task/routes.tsx — the domain owns its <Route>
export const taskRoutes = <Route path="tasks" element={<TasksPage />} />;`;

export const webRouteMapFile = `// domains/tenant/routes.tsx — composes every domain under :tenantSlug
export const tenantRoutes = (
  <Fragment>
    <Route path="/invite/:token" element={<AcceptInvitePage />} />
    <Route path="/app" element={<RequireAuth />}>
      <Route index element={<AppIndexRedirect />} />
      <Route path=":tenantSlug" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="settings" element={<TenantSettingsPage />} />
        {taskRoutes}      {/* ← drop a new domain's routes here */}
        {articleRoutes}
        {billingRoutes}
        {accountRoutes}
      </Route>
    </Route>
  </Fragment>
);`;

/** Reads + page chrome — first half of the canonical TasksPage template. */
export const pageReadsFile = `// pages/TasksPage.tsx — reads + chrome
export function TasksPage() {
  const { t } = useTranslation();
  // Tenant from TenantProvider — never parse the URL here.
  const { tenant } = useTenant();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", tenant.id],
    queryFn: () => taskApi.list(tenant.id),
  });

  return (
    <div className="grid gap-6">
      <PageHeader title={t("tasks.title")} description={t("tasks.description")} />
      {isLoading ? (
        <PageLoading />
      ) : tasks?.length ? (
        /* …list… */
        null
      ) : (
        <EmptyState>{t("tasks.empty")}</EmptyState>
      )}
    </div>
  );
}`;

/** Writes half of the template — mutations, confirm, showApiError. */
export const pageWritesFile = `// pages/TasksPage.tsx — writes
const queryClient = useQueryClient();
const confirm = useConfirm();

const deleteMutation = useMutation({
  mutationFn: (id: string) => taskApi.delete(tenant.id, id),
  onSuccess: () =>
    queryClient.invalidateQueries({ queryKey: ["tasks", tenant.id] }),
  onError: (err) => showApiError(err, t("tasks.deleteFailed")),
});

async function handleDelete(task: TaskDto) {
  const ok = await confirm({
    title: t("tasks.deleteTitle"),
    confirmLabel: t("common.delete"),
    cancelLabel: t("common.cancel"),
    destructive: true,
  });
  if (ok) deleteMutation.mutate(task.id);
}`;

export const webTreeFile = `// Same domain name on the web — fixed roles, optional folders.
apps/web/src/domains/task/
├── api.ts           typed HTTP — the only network boundary
├── pages/           route screens (TasksPage.tsx, PascalCase)
├── routes.tsx       the domain's <Route>; composed under :tenantSlug
└── components/      domain UI (kebab-case) — add with the first one

// When the domain needs shared React state:
//   context/<name>-provider.tsx   Provider + useX (auth, tenant, …)
//   hooks/                        reusable hooks that aren't just useX

// Same optional folders as the API (add with the first file — not empty):
//   constants/<topic>.constants.ts   static values
//   utils/<topic>.utils.ts           non-React helpers with logic
//   (React helpers stay in hooks/; app-root lib/ stays cross-cutting)

// Outside domains (shared shell, not product features):
//   app/          App.tsx route map, config.ts
//   layouts/      AppLayout, AuthLayout, RequireAuth
//   theme/ · i18n/ · lib/
//
// Base UI is @app/ui (Button, Card, PageHeader, EmptyState, useConfirm).
// No top-level src/components/ — product UI stays in the owning domain.`;

export const domainMapFile = `// Domain-driven: one feature = one folder on BOTH sides.
// Same name. Fixed roles. Shared contract in packages/shared.

apps/api/src/domains/task/              apps/web/src/domains/task/
├── schema/          tables             ├── api.ts        typed HTTP
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

export const middlewareFile = `// require-auth.middleware.ts → re-export from middleware/index.ts
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE) ?? bearerSessionToken(c);
  if (!token) throw new HttpError(401, "Not authenticated");

  const sessionUser = await getSessionUser(token);
  if (!sessionUser) {
    clearSessionCookie(c);
    throw new HttpError(401, "Session expired");
  }

  c.set("user", sessionUser);
  c.set("sessionToken", token);
  await next();
});

// Tenant groups: .use("*", requireAuth, requireTenant) once in routes/index.ts`;

export const constantsFile = `// constants/<topic>.constants.ts — static values only
export const SESSION_COOKIE = "app_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Catalogs live here too (billing/constants/plans.constants.ts)
export const PLAN_CATALOG: readonly PlanDto[] = [ /* free · starter · pro */ ];

// No helpers here — those go in utils/<topic>.utils.ts`;

export const utilsFile = `// utils/slug.utils.ts — helpers WITH logic (not static catalogs)
export function slugify(name: string): string { /* … */ }

export async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  for (;;) {
    if (!(await tenantRepository.findTenantBySlug(candidate))) return candidate;
    candidate = \`\${base}-\${Math.random().toString(36).slice(2, 6)}\`;
  }
}

// Keep app-root lib/ for cross-cutting pure utilities.`;

export const templateFile = `// template/verify-email.template.ts — outbound email today
export function verifyEmailTemplate(name: string, url: string) {
  return {
    subject: "Confirm your email",
    html: emailLayout(
      "Confirm your email",
      \`<p>Hi \${name}! Confirm your email…</p>\`,
      "Confirm email",
      url,
    ),
  };
}

// template/index.ts → services import from "./template"`;

export const serviceFile = `// service.ts — ONLY when there's real business logic
export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  await authRepository.insertSession({
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return token; // routes call setSessionCookie(c, token)
}

// Plain CRUD skips this file — route/tool calls the repository directly.`;

export const appMountFile = `// app.ts — each domain group mounts once
app.route("/api/mcp", mcpRoutes);                  // API-key Bearer
app.route("/api/auth", authRoutes);
app.route("/api/account", accountRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/tenants", tenantRoutes);
app.route("/api/tenants/:tenantId/billing", billingRoutes);
app.route("/api/tenants/:tenantId/tasks", taskRoutes);
app.route("/api/tenants/:tenantId/articles", articleRoutes);
app.route("/api/articles", publicArticleRoutes);   // public surface
app.route("/api/tenants/:tenantId/agent", agentRoutes);
app.route("/api/invites", inviteRoutes);           // token auth
app.route("/api/join", joinRoutes);                // platform invite

// Tenant groups: requireAuth + requireTenant in routes/index.ts`;

export const dbSchemaBarrelFile = `// db/schema.ts — barrel for migrations
export * from "@/domains/auth/schema";
export * from "@/domains/tenant/schema";
export * from "@/domains/task/schema";
export * from "@/domains/usage/schema";
export * from "@/domains/article/schema";
export * from "@/domains/admin/schema";
// Tables live in domains — this file only re-exports.`;

/** After the schema exists — what to import to query it. */
export const drizzleImportsFile = `// repository.ts — three places things come from

// 1. Operators (eq, and, or, desc, ilike…) — drizzle-orm
import { and, desc, eq, ilike } from "drizzle-orm";

// 2. The live connection — apps/api/src/db/client.ts
import { db } from "@/db/client";

// 3. YOUR table (the pgTable you just declared)
import { tasks, type Task } from "./schema";

// Join another domain's table when you need it
import { users } from "@/domains/auth/schema";

// Column helpers for NEW tables live in drizzle-orm/pg-core:
//   import { boolean, index, pgTable, text, uuid } from "drizzle-orm/pg-core";`;

/** Read path — select · from · join · where · orderBy. */
export const drizzleSelectFile = `// Reads chain like SQL — left to right, top to bottom
const where = search
  ? and(eq(tasks.tenantId, tenantId), ilike(tasks.title, \`%\${search}%\`))
  : eq(tasks.tenantId, tenantId);

return db
  .select({ task: tasks, authorName: users.name }) // what you want back
  .from(tasks)                                      // main table
  .leftJoin(users, eq(users.id, tasks.authorId))    // optional join
  .where(where)                                     // filters (always tenantId)
  .orderBy(desc(tasks.createdAt));                  // sort

// .select() with no args → every column on the table
// Shape the row: .select({ id: tasks.id, title: tasks.title })`;

/** Write path — insert · update · delete + returning. */
export const drizzleWritesFile = `// Writes — always .returning() so you get the row back
const [task] = await db
  .insert(tasks)
  .values({ tenantId, authorId, title, completed: false })
  .returning();

const [updated] = await db
  .update(tasks)
  .set({ title, completed })
  .where(and(eq(tasks.id, taskId), eq(tasks.tenantId, tenantId)))
  .returning();

const [removed] = await db
  .delete(tasks)
  .where(and(eq(tasks.id, taskId), eq(tasks.tenantId, tenantId)))
  .returning();

// Destructure [row] — Drizzle returns an array`;

/** Operators you'll reach for constantly. */
export const drizzleOperatorsFile = `// drizzle-orm — the toolbox next to every query
eq(tasks.id, taskId)              // =
and(a, b)  /  or(a, b)            // combine filters
ilike(tasks.title, \`%\${q}%\`)      // case-insensitive LIKE
desc(tasks.createdAt)             // ORDER BY … DESC
asc(tasks.createdAt)              // ORDER BY … ASC

// Always scope tenant data:
.where(eq(tasks.tenantId, tenantId))
// Missing tenantId in where = cross-tenant leak`;

/**
 * Real shape of a generated migration — add a column (+ index).
 * Mirrors apps/api/drizzle/0008_watery_blue_blade.sql.
 */
export const migrationExampleFile = `-- You added publishedAt on articles.schema.ts, then ran db:generate.
-- This file is what landed in apps/api/drizzle/ — never typed by hand.

ALTER TABLE "articles" ADD COLUMN "published_at" timestamp with time zone;
--> statement-breakpoint
CREATE INDEX "articles_published_idx" ON "articles" USING btree ("published_at");

-- Same shape as other real migrations in this repo:
--   ALTER TABLE "users" ADD COLUMN "is_platform_admin" boolean DEFAULT false NOT NULL;
--   ALTER TABLE "tenants" ADD COLUMN "plan_id" text DEFAULT 'free' NOT NULL;`;

/** MediaStore contract — apps/api/src/lib/media-store.ts */
export const mediaStoreFile = `// lib/media-store.ts — the only interface domains touch for files
export interface MediaStore {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  has(key: string): Promise<boolean>;
  remove(key: string): Promise<void>;
}
// Key = "<tenantId>/uploads/<uuid>.webp" — never a cross-tenant path`;

/** Backend pick — article media utils (trimmed). */
export const mediaBackendsFile = `// domains/article/utils/media.utils.ts
import { isR2Configured, r2Store } from "@/integrations/r2";

export const usingR2 = isR2Configured();
const backend: MediaStore = usingR2 ? r2Store : localStore;

export const mediaStore = backend;
// No R2 env → local disk under MEDIA_DIR (fine for dev).
// Render's disk is ephemeral — set CLOUDFLARE_* + R2_PUBLIC_BASE_URL in prod.`;

/** writeMedia — compress then put. */
export const writeMediaFile = `// domains/article/utils/media.utils.ts
export async function writeMedia(key: string, data: Buffer) {
  const target = withCompressedExt(key);       // → .webp
  const compressed = await compressImage(data); // sharp
  await mediaStore.put(target, compressed);
  return { path: \`/\${target}\`, sizeBytes: compressed.byteLength };
}
// Callers never pick R2 vs disk — mediaStore already did.`;

/** R2 integration — S3 client (trimmed). */
export const r2IntegrationFile = `// integrations/r2.ts — S3 API against Cloudflare R2
export function isR2Configured(): boolean {
  return Boolean(ENDPOINT && ACCESS_KEY_ID && SECRET_ACCESS_KEY && R2_PUBLIC_BASE_URL);
}

export const r2Store: MediaStore = {
  async put(key, data) {
    await s3().send(new PutObjectCommand({
      Bucket: BUCKET, Key: key, Body: data, ContentType: contentType(key),
    }));
  },
  // has / get / remove — same S3 commands
};
// Server redirects to R2_PUBLIC_BASE_URL — it does not proxy bytes.`;

/** Env vars for R2 — copy into Render after creating the bucket + token. */
export const r2EnvFile = `# .env / Render Environment — all optional; missing → local disk
CLOUDFLARE_S3_API=https://<account-id>.r2.cloudflarestorage.com
CLOUDFLARE_ACCESS_KEY_ID=
CLOUDFLARE_SECRET_ACCESS_KEY=
CLOUDFLARE_MEDIA_BUCKET=app
R2_PUBLIC_BASE_URL=https://pub-<hash>.r2.dev

# Checklist:
#   1. Create bucket (name matches CLOUDFLARE_MEDIA_BUCKET)
#   2. Enable public access / copy R2_PUBLIC_BASE_URL
#   3. Create R2 token → Access Key ID + Secret
#   4. sync: false on Render for the secret keys`;

/** OpenAI key gate — integrations/openai.ts */
export const openAiKeyFile = `// integrations/openai.ts — only place that knows the OpenAI SDK
export function hasOpenAiKey(): boolean {
  return Boolean(env.openaiApiKey);
}

export function getOpenAI(): OpenAI {
  if (!env.openaiApiKey) throw new Error("OPENAI_API_KEY not set");
  return new OpenAI({ apiKey: env.openaiApiKey });
}
// Missing key → agent FAB hidden; chat returns 503. Nothing else breaks.`;

/** Tool-calling loop — integrations/openai.ts (shape). */
export const openAiLoopFile = `// integrations/openai.ts — model → tools → model
export async function runToolLoop(opts: {
  model: string;
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  tools: LoopTool[];
}) {
  // chat.completions.create with tools…
  // execute each tool call → feed results back → until a final reply
  return { reply, calls, usage }; // usage → billing ledger
}
// Domains never import "openai" — only @/agent/tool + this integration.`;

/** In-app assistant policy — agent/assistant.ts (trimmed). */
export const assistantFile = `// agent/assistant.ts — product policy; loop lives in integrations/openai
export async function runAssistant(ctx, messages, onEvent?) {
  const tools = allTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    run: async (rawArgs) => {
      const args = z.object(tool.inputSchema).parse(rawArgs);
      const data = await tool.execute(ctx, args); // tenant from ctx
      return { text: JSON.stringify(data ?? null) };
    },
  }));
  return runToolLoop({ model: env.assistantModel, system: systemPrompt(ctx), messages, tools });
}`;

/** OPENAI_API_KEY in env — optional. */
export const openAiEnvFile = `# .env / Render Environment
OPENAI_API_KEY=sk-…                 # sync: false on Render
ASSISTANT_MODEL=gpt-4o-mini         # optional override

# No key?
#   - agent FAB stays hidden
#   - /api/.../agent/chat → 503
#   - rest of the app works
#
# Checklist: create secret key → paste once → never commit`;

/** Resend sendEmail — integrations/resend.ts */
export const resendSendFile = `// integrations/resend.ts — only place that talks to Resend
export async function sendEmail({ to, subject, html }) {
  if (!env.resendApiKey) {
    // Dev: log subject + size — never log HTML (tokens in links)
    logger.info(\`[email] (dev, not sent) to: \${to} · \${subject}\`);
    return;
  }
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: \`Bearer \${env.resendApiKey}\`, … },
    body: JSON.stringify({ from: env.mailFrom, to, subject, html }),
  });
}
// Domains call sendEmail — they never import Resend.`;

/** emailLayout — lib/email.ts shape. */
export const resendLayoutFile = `// lib/email.ts — HTML shell for transactional mail
export function emailLayout(title, bodyHtml, ctaLabel, ctaUrl) {
  return \`<!doctype html>… CTA button … fallback link …\`;
}
// Auth / tenant / admin build body + CTA; sendEmail delivers.
// Verify, reset, invite, platform invite — same layout.`;

/** RESEND + MAIL_FROM env. */
export const resendEnvFile = `# .env / Render Environment
RESEND_API_KEY=re_…                 # sync: false on Render
MAIL_FROM=${brand.displayName} <hello@mail.example.com>

# No key?
#   - emails log to the API console (dev)
#   - invites / verify / reset still "work" locally
#
# Production checklist:
#   1. Add + verify domain in Resend
#   2. Create API key (sending access)
#   3. MAIL_FROM must use a verified domain`;

/** Custom domain + APP_URL after CNAME → Render. */
export const domainEnvFile = `# After CNAME at your registrar + Custom Domain on Render:
APP_URL=https://app.example.com
CORS_ORIGIN=https://app.example.com   # same origin in this template

# Flow:
#   1. Render → Settings → Custom Domains → Add
#   2. Copy CNAME target (…onrender.com)
#   3. Registrar DNS → CNAME name=app → that target
#   4. Wait Verified + Certificate Issued
#   5. Set APP_URL (sync: false) to the custom host
#
# Cookies / magic links use APP_URL — keep it in sync.`;

/** Zod boot validation — apps/api/src/lib/env.ts (trimmed). */
export const envSchemaFile = `// lib/env.ts — validated at boot; bad values exit(1)
const schema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().default("postgres://app:app@localhost:5442/app_base"),
  APP_URL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),   // missing → emails to console
  OPENAI_API_KEY: z.string().optional(),   // missing → agent hidden
  SELF_SIGNUP_ENABLED: z.string().default("true")
    .transform((v) => v !== "false"),
  PLATFORM_ADMIN_EMAILS: z.string().optional(),
  // R2 keys optional — without them, media falls back to local disk
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("[env] invalid environment variables:…");
  process.exit(1);
}`;

/** render.yaml — production blueprint (trimmed). */
export const renderYamlFile = `# render.yaml — one web service (API + SPA) + Postgres
services:
  - type: web
    name: app
    runtime: node          # no custom Dockerfile — Render's Node runtime
    buildCommand: npm ci --include=dev && npm run build
    startCommand: npm start
    preDeployCommand: npm run db:migrate
    healthCheckPath: /api/health
    autoDeploy: true
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: app-db
          property: connectionString
      - key: APP_URL
        sync: false        # set in the Render dashboard
      - key: RESEND_API_KEY
        sync: false
      - key: OPENAI_API_KEY
        sync: false

databases:
  - name: app-db
    plan: basic-256mb
    postgresMajorVersion: "16"`;

/** Secrets stay out of git — sync: false on Render. */
export const renderSecretsFile = `# Secrets never live in the repo
# .env          — local only (gitignored)
# .env.example  — empty / commented placeholders only

# render.yaml
envVars:
  - key: APP_URL
    sync: false              # value set in the Render dashboard
  - key: RESEND_API_KEY
    sync: false
  - key: OPENAI_API_KEY
    sync: false
  - key: DATABASE_URL
    fromDatabase:            # wired from managed Postgres — not typed by hand
      name: app-db
      property: connectionString

# New secret checklist:
#   1. empty placeholder in .env.example
#   2. Zod field in apps/api/src/lib/env.ts
#   3. render.yaml with sync: false (or fromDatabase)`;

export const agentRegistryFile = `// agent/registry.ts — all tools in one list
export const allTools = [
  ...tenantTools,
  ...taskTools,
  ...articleTools,
  ...agentTools,
];
// Domains export tools/; agent owns chat + remote protocol.`;
