/**
 * Code snippets shown in the resource walk — mirror real repo conventions.
 * If a convention changes, update the matching snippet here.
 */
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

export const schemaFile = `/**
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

export const repositoryMethodFile = `/**
 * List tasks
 *
 * Newest first; optional case-insensitive title search.
 *
 * @param tenantId - Tenant that owns the tasks
 * @param search - Optional case-insensitive title filter
 * @returns Tasks with author names, newest first
 */
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

export const routeHandlerFile = `/**
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
