import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  BoxIcon,
  CheckIcon,
  CloudIcon,
  DatabaseIcon,
  EraserIcon,
  FolderTreeIcon,
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
import { useAuth } from "@/domains/auth/auth-provider";
import { ThemeControls } from "@/theme/theme-controls";
import { useTheme } from "@/theme/theme-provider";
import { BrandIcon } from "../brand-icon";
import { CodeBlock } from "../code-block";
import {
  AccountMock,
  AgentChatMock,
  AuthTables,
  EnvMock,
  flows,
  LoginMock,
  McpKeysMock,
  RenderMock,
  ShellMock,
  TaskTable,
  TasksMock,
  TenantTables,
  TerminalMock,
  WindowBar,
  type Screen,
} from "../product-preview";

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

const repositoryFile = `/** domains/task/repository.ts — each method owns its full query */
export const taskRepository = {
  /**
   * List tasks
   *
   * Newest first for the tenant.
   */
  async list(tenantId: string): Promise<TaskWithAuthor[]> {
    return db
      .select({ task: tasks, authorName: users.name })
      .from(tasks)
      .leftJoin(users, eq(users.id, tasks.authorId))
      .where(eq(tasks.tenantId, tenantId))
      .orderBy(desc(tasks.createdAt));
  },

  /**
   * Insert a task
   *
   * Returns the new row.
   */
  async insert(values: {
    tenantId: string;
    authorId: string | null;
    title: string;
    completed: boolean;
  }): Promise<Task> {
    const [task] = await db.insert(tasks).values(values).returning();
    return task;
  },
};`;

const routeFile = `/**
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
}

// routes/index.ts — wires handlers; auth + tenant middleware once for the group
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

const webApiFile = `// apps/web/src/domains/task/api.ts — the only network boundary
import { api } from "@/lib/api"; // raw HTTP client — never called from a page

export const taskApi = {
  list: (tenantId: string) => api.get<TaskDto[]>(\`/tenants/\${tenantId}/tasks\`),
  create: (tenantId: string, body: { title: string }) =>
    api.post<TaskDto>(\`/tenants/\${tenantId}/tasks\`, body),
  update: (tenantId: string, id: string, body: { completed: boolean }) =>
    api.patch<TaskDto>(\`/tenants/\${tenantId}/tasks/\${id}\`, body),
  delete: (tenantId: string, id: string) => api.delete(\`/tenants/\${tenantId}/tasks/\${id}\`),
};`;

const pageFile = `// pages/TasksPage.tsx — the canonical page template (copy this shape)
export function TasksPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

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
  return <PageHeader title="Tasks" description="Example resource" />;
  // …list, EmptyState when empty, useConfirm() for destructive actions
}`;

const apiTreeFile = `// A feature is a folder — the same shape every API domain follows.
apps/api/src/domains/task/
├── schema.ts        Drizzle table
├── repository.ts    all SQL (scoped by tenantId)
├── dto.ts           row → API shape
├── routes/          handlers + index.ts (route map)
└── tools/           agent tools + index.ts (registry)

// service.ts is added only when a domain grows real business logic.`;

const webTreeFile = `// The frontend mirrors the API, one domain at a time.
apps/web/src/
├── domains/task/
│   ├── api.ts            typed calls — the only network boundary
│   ├── pages/            route screens: TasksPage.tsx (PascalCase)
│   ├── routes.tsx        the domain's <Route> element
│   └── task-card.tsx     domain components (kebab-case)
├── app/                  App.tsx (route map), config.ts
├── layouts/              AppLayout, AuthLayout, RequireAuth
├── components/           app components with product copy (role-select)
└── lib/                  api.ts (HTTP client), utils.ts — no domain knowledge

// @app/ui (packages/ui) — the tenant-agnostic base UI:
//   Button, Card, Input, Dialog · PageHeader · EmptyState · useConfirm`;

// One visual per step so nothing stacks: the folder convention first, then the
// files — table, queries, route, tool, screen — the repo's real task domain.
const resourceSlices: Slice[] = [
  {
    id: "convention",
    eyebrow: "The convention",
    title: "A feature is a folder",
    body: "Before the files, the shape. On the API, every feature is a domain — a single folder that owns its slice top to bottom, and each file has one fixed role, so you always know where a thing lives (and where to add the next one). Import directions are enforced by lint, so the structure can't quietly rot as the app grows.",
    points: [
      "One folder per feature — schema, repository, dto, routes, tools",
      "Fixed roles, never a grab-bag file; service.ts only when there's real logic",
      "The repository owns the SQL; every query filters by tenantId",
      "DTO mapping lives in dto.ts — never inline in the repository or route",
      "Boundaries fail the lint, not just code review",
    ],
    visual: <CodeBlock filename="apps/api/src/domains/task/" code={apiTreeFile} lang="text" />,
  },
  {
    id: "schema",
    eyebrow: "The table",
    title: "A table is a pgTable in its domain",
    body: "The tasks table shows the exact shape every table you add will follow: a uuid primary key, a tenant_id foreign key that scopes it to a workspace, the timestamps helper, and an index on the tenant. Run db:generate and the SQL migration is derived from this file — the schema stays the source of truth.",
    points: [
      "tenant_id ties every row to a workspace and cascades on delete",
      "author_id references the user but is nullable — set null on delete",
      "Migrations are generated from the schema, never hand-written",
    ],
    visual: <TaskTable />,
  },
  {
    id: "repository",
    eyebrow: "The queries",
    title: "All SQL lives in one repository",
    body: "Every method takes a tenantId and filters by it — isolation isn't a reminder here, it's the only way the data can be reached at all. For a tenant-scoped resource, stick to list / find / insert / update / delete. Each method writes its query in full — no shared helpers — and returns the row; DTO mapping stays in dto.ts.",
    points: [
      "No query exists without a tenant filter",
      "CRUD is named list / find / insert / update / delete",
      "Each method owns its query end to end — readable without jumping around",
      "Returns rows — dto.ts maps to the API shape; routes never write SQL",
    ],
    visual: <CodeBlock filename="domains/task/repository.ts" code={repositoryFile} lang="ts" />,
  },
  {
    id: "route",
    eyebrow: "The route",
    title: "A thin handler, wired in one line",
    body: "The handler is structured as Input → Processing → Output: validate with the shared schema, call the repository, map through the DTO. It gets one line in routes/index.ts, where auth and tenant middleware already run for the whole group — so the handler never checks a session or resolves a tenant itself.",
    points: [
      "Handler sections: Input → Processing → Output",
      "The tenant comes from context, never a request param",
      "Middleware is applied once via .use — new routes are isolated by default",
    ],
    visual: (
      <CodeBlock filename="domains/task/routes/create-task.route.ts" code={routeFile} lang="ts" />
    ),
  },
  {
    id: "tool",
    eyebrow: "The agent",
    title: "One file teaches the assistant",
    body: "The same resource becomes an agent tool with a single defineTool — a name, a Zod input and an execute that reuses the repository you already wrote. That one definition drives the in-app chat, local Cursor over stdio and the remote MCP server, with zero extra glue.",
    points: [
      "Same definition drives the chat, stdio and the remote MCP server",
      "summarize marks a write — it shows up as a chip in the chat",
      "Tools never import MCP or OpenAI — the lint blocks it",
    ],
    visual: (
      <CodeBlock filename="domains/task/tools/create-task.tool.ts" code={toolFile} lang="ts" />
    ),
  },
  {
    id: "web-convention",
    eyebrow: "The frontend",
    title: "React, organized by the same domains",
    body: "The web app mirrors the API: one folder per feature under domains/, and everything else is shared shell. A domain holds its typed api.ts, its route-level pages/, its routes.tsx and any domain-specific components. Generic, tenant-agnostic UI lives in the @app/ui package; app shell and layouts sit outside the domains.",
    points: [
      "domains/<feature>/ mirrors the API — api.ts, pages/, routes.tsx, components",
      "app/ holds App.tsx + config; layouts/ holds AppLayout, AuthLayout, RequireAuth",
      "Base UI (Button, Card, PageHeader, EmptyState…) is imported from @app/ui",
      "Imports use the @/ alias; @app/ui never reaches back into a domain",
    ],
    visual: <CodeBlock filename="apps/web/src/" code={webTreeFile} lang="text" />,
  },
  {
    id: "api",
    eyebrow: "The network boundary",
    title: "One api.ts wraps every call",
    body: "The only file that touches the network is the domain's api.ts — a thin object over the shared HTTP client, returning the same DTO the API sends. Pages never call fetch or the raw client directly, so every request for a resource has exactly one place to change.",
    points: [
      "Network only through the domain api.ts — never a raw fetch in a page",
      "Returns the shared DTO type — the client is typed end to end",
      "The tenant id is part of the path, mirroring the API's routes",
    ],
    visual: <CodeBlock filename="apps/web/src/domains/task/api.ts" code={webApiFile} lang="ts" />,
  },
  {
    id: "page",
    eyebrow: "The page",
    title: "Reads are queries, writes invalidate",
    body: "Every page follows the same TanStack Query template: reads are a useQuery keyed by the tenant, writes are a useMutation that invalidates on success — so you never hand-manage a loading flag or a refresh. Shared pieces from @app/ui — PageHeader, PageLoading, EmptyState and useConfirm — cover the states so pages stay about the feature.",
    points: [
      "useQuery for reads, useMutation + invalidate for writes",
      "PageLoading while loading, EmptyState when a list is empty",
      "Destructive actions go through useConfirm(); errors through showApiError()",
    ],
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
    eyebrow: "The screen",
    title: "The result: a full CRUD feature",
    body: "That's the whole slice, top to bottom — and this is the screen it powers. Per-tenant create, list, toggle and delete, wired end to end. Copy the folder, rename it, and your own resource lands exactly here.",
    points: [
      "Per-tenant create, list, toggle and delete out of the box",
      "The exact shape you'll clone for your product's resources",
      "Delete the example and drop yours in — nothing else breaks",
    ],
    visual: <TasksMock />,
  },
];

type Chapter = {
  eyebrow: string;
  title: string;
  body: string;
  /** A single static mock… */
  mock?: ComponentType;
  /** …or a multi-screen flow that keeps the browser chrome fixed and swaps the body. */
  flow?: Screen[];
};

type Foundation = {
  icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  /** The evidence for this pillar: a schema map, a terminal, a Render panel. */
  visual: ReactNode;
};

// The product tour as a flow: land, sign up, recover, then step into the
// workspace and each thing it ships with. Emails hang off the flow that sends
// them rather than standing alone.
const chapters: Chapter[] = [
  {
    eyebrow: "Sign in",
    title: "Login, clean and familiar",
    body: "Email, password, a link to recovery, and secure sessions on submit — scrypt hashing and an httpOnly cookie, no auth vendor. Built with shadcn/ui, ready to rebrand.",
    mock: LoginMock,
  },
  {
    eyebrow: "Sign up",
    title: "Registration that sets everything up",
    body: "Name, email, password. Each new user gets a personal tenant and a verification email automatically — the link is single-use and expires in 24 hours.",
    flow: flows.register,
  },
  {
    eyebrow: "Password recovery",
    title: "Forgot password, fully handled",
    body: "Request a reset link by email, then set a new password on a screen guarded by a short-lived, single-use token — validated server-side and hashed with scrypt.",
    flow: flows.recovery,
  },
  {
    eyebrow: "The app shell",
    title: "A workspace, not a blank page",
    body: "Sidebar nav, a tenant switcher that appears only with more than one, a user menu and the theme controls. Your screens drop straight into the outlet.",
    mock: ShellMock,
  },
  {
    eyebrow: "The AI agent",
    title: "A chat that gets things done",
    body: "A floating assistant in every tenant: ask or command, it runs the right tools, shows what changed as a chip, and refreshes the data on its own.",
    mock: AgentChatMock,
  },
  {
    eyebrow: "Your account",
    title: "Profile and security, built in",
    body: "Every user manages their own profile and password from a dedicated account screen — the same patterns you'll reuse for any personal settings you add.",
    mock: AccountMock,
  },
  {
    eyebrow: "Team & invites",
    title: "Bring the rest of the team",
    body: "Owners and admins invite by email and pick a role; members and pending invites live in settings, each revocable. The invite lands as a 7-day link in their inbox.",
    flow: flows.invite,
  },
  {
    eyebrow: "Bring your own tools",
    title: "The same tools, over MCP",
    body: "Mint a tenant-scoped API key and plug the remote MCP server into Cursor or Claude — the agent's tools, right in your editor.",
    mock: McpKeysMock,
  },
];

// The database, explained one domain at a time: each group gets its own copy
// and just its tables, so the models read as a story instead of a wall of cards.
type DbGroup = {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  visual: ReactNode;
};

const dbGroups: DbGroup[] = [
  {
    eyebrow: "Identity",
    title: "Users, sessions and tokens",
    body: "The auth domain owns everything about a person: their credentials, the sessions that keep them signed in, and the single-use tokens emailed for verification and password resets. Passwords are scrypt hashes; sessions and tokens store only a hash, never the raw value.",
    points: [
      "users holds the account; a unique email is the login",
      "sessions and action_tokens reference user_id and cascade on delete",
      "api_keys are personal and scoped to one tenant for MCP access",
    ],
    visual: <AuthTables />,
  },
  {
    eyebrow: "Tenancy",
    title: "Workspaces and who belongs to them",
    body: "Every account works inside a tenant. tenant_members is the join table between users and tenants with a role, and tenant_invites carries pending invitations by email. This is the backbone that makes the whole app multi-tenant.",
    points: [
      "tenant_members has a composite key of (tenant_id, user_id)",
      "role is an enum — owner, admin, member — enforced at the type level",
      "Invites expire and carry the role the person will get on accept",
    ],
    visual: <TenantTables />,
  },
];

const repoTreeFile = `app-base/
├── apps/
│   ├── api/          Hono + Drizzle + Postgres
│   └── web/          React + Vite SPA
├── packages/
│   └── shared/       Zod schemas + DTOs (both sides)
├── .cursor/rules/    conventions the AI follows
├── render.yaml       one-service deploy
└── turbo.json        task graph`;

// The outermost structural pillar: how the repo is laid out, before we drill
// into the data model and a single resource.
const monorepoPillar: Foundation = {
  icon: FolderTreeIcon,
  eyebrow: "The layout",
  title: "One typed monorepo, wired end to end",
  body: "Everything lives in one repo run by npm workspaces and Turborepo: the Hono API, the React SPA, and a shared package of Zod schemas both sides import. That shared package is the trick — change a request shape there and whichever side you forgot stops compiling.",
  points: [
    "packages/shared is one source of truth for types across API and web",
    "In production the API serves the built SPA — one origin, no CORS",
    "TypeScript everywhere, end to end — a domain is a folder on both sides",
  ],
  visual: <CodeBlock filename="app-base" code={repoTreeFile} lang="text" />,
};

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

// The foundations that follow the data model: configuration, then running it.
const foundations: Foundation[] = [
  {
    icon: SlidersIcon,
    eyebrow: "Configuration",
    title: "One .env, validated at boot",
    body: "Everything the app reads comes from a single .env, checked by Zod when the process starts — a missing or malformed var fails fast with a clear message. Only two things matter to run locally, and they already have working defaults; the rest are optional and degrade gracefully.",
    points: [
      "DATABASE_URL and APP_URL are all you need — both default for local dev",
      "No RESEND_API_KEY? Emails print to the console instead of sending",
      "No OPENAI_API_KEY? The AI agent is simply hidden — nothing breaks",
      "SELF_SIGNUP_ENABLED flips the app between open signup and invite-only",
    ],
    visual: <EnvMock />,
  },
  {
    icon: CloudIcon,
    eyebrow: "Storage",
    title: "Object storage, ready before you need it",
    body: "Any domain that has to store a file — images, avatars, exports, whatever your product needs — goes through one small interface: put, get, has, remove. Add R2 credentials and it writes straight to Cloudflare's object storage with a public URL; leave them out and it falls back to the local disk, so there's a resource to build on from day one, not a feature you have to wire yourself.",
    points: [
      "MediaStore is the only interface a domain touches — swap the backend without touching callers",
      "No R2 credentials? Falls back to the local disk automatically — nothing to configure to start",
      "Images already run through it, compressed to WebP on write — copy that domain for your own files",
    ],
    visual: <CodeBlock filename="lib/media-store.ts" code={mediaStoreFile} lang="ts" />,
  },
  {
    icon: TerminalIcon,
    eyebrow: "Run it locally",
    title: "One command, the whole stack up",
    body: "No local Postgres to install: npm run setup uses Docker to boot Postgres 16, applies the migrations and seeds a demo workspace. npm run dev then starts the API and the SPA together — you're clicking a real app in under a minute.",
    points: [
      "Docker Compose runs Postgres on :5442 — nothing to install by hand",
      "setup migrates and seeds a demo tenant and user for you",
      "npm run dev boots the API (:5000) and the SPA (:3000) at once",
      "The .env ships with working local defaults, validated at boot",
    ],
    visual: <TerminalMock />,
  },
];

// Deploy lives at the end of the story, next to the clone-to-production walkthrough.
const renderPillar: Foundation = {
  icon: RocketIcon,
  eyebrow: "Ship to production",
  title: "Deploys to Render from one YAML",
  body: "Production is described once in render.yaml: a single web service that runs the API and serves the built SPA, plus a managed Postgres. Push to main and Render builds, runs migrations on pre-deploy, and health-checks before going live — no deploy scripts to write.",
  points: [
    "One web service (API + SPA, one origin) and one managed Postgres",
    "Migrations run automatically on pre-deploy, before traffic shifts",
    "Auto-deploy on push to main, gated by a /api/health check",
    "Secrets stay out of the repo with sync: false",
  ],
  visual: <RenderMock />,
};

// The closing argument: this is owned code, not a dependency.
const ownership: Included[] = [
  {
    icon: EraserIcon,
    title: "Delete the example",
    description:
      "Tasks are a placeholder. Remove the domain, drop the table, and put your product's resources in its place — nothing else breaks.",
  },
  {
    icon: UnlockIcon,
    title: "Nothing to unsubscribe from",
    description:
      "Auth is scrypt and cookies, email is one swappable module, deploy is a YAML file. Swap any piece without asking permission.",
  },
  {
    icon: PenLineIcon,
    title: "Rewrite the rules",
    description:
      "The conventions are markdown in .cursor/rules/, each scoped by glob to the files it governs — so the agent reads the same playbook. Disagree with one? Edit it, and it follows you instead.",
  },
];

const stack: { label: string; items: string[] }[] = [
  { label: "Frontend", items: ["React 19", "Vite", "Tailwind", "shadcn/ui", "TanStack Query"] },
  { label: "Backend", items: ["Hono", "Zod", "Node"] },
  { label: "Database", items: ["PostgreSQL", "Drizzle ORM"] },
  { label: "AI", items: ["OpenAI", "Model Context Protocol (MCP)"] },
  { label: "Tooling", items: ["TypeScript", "Turborepo", "oxlint", "Prettier"] },
];

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

export function LandingPage() {
  const { me } = useAuth();
  const { selfSignupEnabled } = useAppConfig();
  useReveal();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <BoxIcon className="size-5 text-primary" />
            App Base
          </Link>
          <nav className="flex items-center gap-2">
            <ThemeControls className="mr-1" />
            {me ? (
              <Button asChild>
                <Link to="/app">
                  Go to app <ArrowRightIcon />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                {selfSignupEnabled && (
                  <Button asChild>
                    <Link to="/register">Try the demo</Link>
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
            Open-source SaaS boilerplate · React + Hono + Postgres
          </p>
          <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            The starting point for your next SaaS
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
            Stop rebuilding auth, tenants, email and an AI agent for every project. This is the
            groundwork — a typed monorepo, organized by domain, ready to become your product.
          </p>
          <div className="mx-auto mt-8 flex w-fit max-w-full items-center gap-2 overflow-x-auto rounded-lg border bg-muted/50 px-4 py-3 font-mono text-sm">
            <TerminalIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">$</span>
            <span className="whitespace-nowrap">git clone https://github.com/fecruzb/app</span>
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" asChild>
              <Link to={me ? "/app" : selfSignupEnabled ? "/register" : "/login"}>
                {me ? "Go to app" : "Try the live demo"} <ArrowRightIcon />
              </Link>
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/40 px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight">A stack you already know</h2>
              <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
                Boring, well-documented tools — nothing exotic to learn before you're productive.
              </p>
            </div>
            <div className="mx-auto mt-8 max-w-2xl divide-y rounded-lg border bg-background">
              {stack.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:gap-6"
                >
                  <p className="w-24 shrink-0 text-sm font-medium">{s.label}</p>
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
            <p className="text-sm font-medium text-primary">What's under the hood</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              The foundations, already wired
            </h2>
            <p className="mx-auto mt-3 text-pretty text-muted-foreground">
              Before any of your product exists, these pieces are in place and connected: how the
              code is laid out, where the data lives, and one real resource walked top to bottom.
            </p>
          </div>
        </section>

        <div className="bg-muted/40">
          <FoundationSection pillar={monorepoPillar} flip={false} />
          <DatabaseFoundation />
          <ResourceSlice />
          {foundations.map((pillar, i) => (
            <FoundationSection key={pillar.title} pillar={pillar} flip={i % 2 === 1} />
          ))}
          <ThemingSection />
        </div>

        <section className="border-t px-4 pt-20 pb-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">The product tour</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              An app that's already assembled
            </h2>
            <p className="mx-auto mt-3 text-pretty text-muted-foreground">
              Those foundations, rendered as real screens. Here's the tour, in the order you'd meet
              them: sign in, get set up, then step into the workspace and everything it ships with.
            </p>
          </div>
        </section>

        {chapters.map((chapter, i) => (
          <ChapterSection key={chapter.title} chapter={chapter} flip={i % 2 === 1} />
        ))}

        <FoundationSection pillar={renderPillar} flip={false} />

        <section className="border-t px-4 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              From here on, it's your code
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
              This isn't a framework you depend on or a service you subscribe to — it's a starting
              point you own. Clone it and every line is yours: rename it, gut it, take it wherever
              your product needs to go. Even this landing page is just the first thing you'll
              replace.
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
                {me ? "Go to app" : "Try the live demo"} <ArrowRightIcon />
              </Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Or skip the demo — clone the repo and start building.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} App Base</span>
          <span>Built with React, Hono and Postgres</span>
        </div>
      </footer>
    </div>
  );
}

/**
 * Live theming demo — the swatches and toggle drive the real ThemeProvider, so
 * clicking one recolors this entire page. The code panel is the actual file you
 * edit to add your own theme.
 */
function ThemingSection() {
  const { themes, themeId, setTheme, mode, setMode } = useTheme();

  return (
    <section className="border-t px-4 py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="reveal">
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <PaletteIcon className="size-4" /> Theming
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            One file, every color — light and dark
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            A theme is just two sets of tokens: light and dark. The primary color drives buttons,
            highlights and focus rings; the rest is neutral surfaces you rarely touch. Pick a
            primary, and the whole UI — landing page included — recolors from CSS variables. No
            component edits, no <code className="font-mono text-xs">dark:</code> classes to chase.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Primary color</p>
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
              <p className="mb-2 text-xs font-medium text-muted-foreground">Mode</p>
              <div className="inline-flex rounded-lg border p-1">
                <button
                  onClick={() => setMode("light")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    mode === "light"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <SunIcon className="size-4" /> Light
                </button>
                <button
                  onClick={() => setMode("dark")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    mode === "dark" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  <MoonIcon className="size-4" /> Dark
                </button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Try it — this page changes as you click. Your choice is saved and shared with the app.
            </p>
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
  return (
    <>
      <section className="border-t px-4 pt-16 pb-4 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
            <DatabaseIcon className="size-4" /> The database
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Postgres, modeled in plain TypeScript
          </h3>
          <p className="mx-auto mt-3 text-pretty text-muted-foreground">
            Persistence is Postgres with Drizzle as the ORM — no separate schema language, no ORM
            console. A table is a <code className="font-mono text-xs">pgTable</code> in the domain
            that owns it. Here are the models the boilerplate already ships, one group at a time.
          </p>
        </div>
      </section>

      {dbGroups.map((group, i) => (
        <DbGroupSection key={group.title} group={group} flip={i % 2 === 1} />
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
  return (
    <>
      <section className="border-t px-4 pt-16 pb-4 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
            <FolderTreeIcon className="size-4" /> Example resource
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            One resource, top to bottom
          </h3>
          <p className="mx-auto mt-3 text-pretty text-muted-foreground">
            <code className="font-mono text-xs">tasks</code> is the one placeholder resource. First
            the convention — a feature is a folder — then the whole slice: the table, the queries,
            the route and the agent tool on the API, then the React domain, its api.ts and page, and
            the screen. This is the exact shape you'd copy for your own.
          </p>
        </div>
      </section>

      {resourceSlices.map((slice, i) => (
        <DbGroupSection
          key={slice.id}
          group={{
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
            aria-label={`Show screen ${i + 1}`}
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
