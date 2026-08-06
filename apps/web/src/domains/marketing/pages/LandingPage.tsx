import { useEffect, type ComponentType } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  BoxIcon,
  CheckIcon,
  KeyRoundIcon,
  LayersIcon,
  MailIcon,
  RocketIcon,
  SparklesIcon,
  TerminalIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppConfig } from "@/app/config";
import { useAuth } from "@/domains/auth/auth-provider";
import { CodeBlock } from "../code-block";
import {
  AgentChatMock,
  ForgotPasswordMock,
  InviteEmailMock,
  InviteMembersMock,
  LoginMock,
  McpKeysMock,
  RegisterMock,
  ResetPasswordMock,
  ShellMock,
  VerifyEmailMock,
} from "../product-preview";

type Included = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

const included: Included[] = [
  {
    icon: KeyRoundIcon,
    title: "Authentication",
    description:
      "Sign-up, login, reset and verification — no auth vendor. scrypt hashing, sessions in an httpOnly cookie.",
  },
  {
    icon: UsersIcon,
    title: "Multi-tenancy",
    description:
      "A personal tenant per user, invites, roles, and every query scoped by tenant_id so data never leaks.",
  },
  {
    icon: SparklesIcon,
    title: "AI agent + remote MCP",
    description:
      "A floating assistant wired to your data — the same tools ship as a remote MCP server for Cursor.",
  },
  {
    icon: MailIcon,
    title: "Transactional email",
    description:
      "Resend behind one swappable module, with a dev fallback that logs to the console instead of sending.",
  },
  {
    icon: LayersIcon,
    title: "Domain architecture",
    description:
      "Front and back organized by domain, with layered boundaries enforced by lint. Scales past the demo.",
  },
  {
    icon: RocketIcon,
    title: "One-service deploy",
    description:
      "API and SPA ship together to Render via a Blueprint, with migrations on pre-deploy and a health check.",
  },
];

type Showcase = {
  id: string;
  eyebrow: string;
  title: string;
  /** A single short paragraph — keep it tight. */
  body: string;
  /** Concrete technical points shown below the copy. */
  highlights: string[];
  filename: string;
  code: string;
  lang?: "ts" | "json" | "text";
};

const showcases: Showcase[] = [
  {
    id: "workspace",
    eyebrow: "The workspace",
    title: "One typed monorepo, three parts",
    body: "A single repo wired with npm workspaces and Turborepo: the Hono API, the React SPA, and a shared package of types both import. Change a request shape and the other side stops compiling — they can't drift apart.",
    highlights: [
      "npm workspaces + Turborepo — cached, parallel tasks",
      "packages/shared: one source of truth for types",
      "API serves the built SPA in prod — one origin, no CORS",
      "TypeScript everywhere, end to end",
    ],
    filename: "repo",
    lang: "text",
    code: `app-base/
├── apps/
│   ├── api/          Hono + Drizzle + Postgres
│   └── web/          React + Vite SPA
├── packages/
│   └── shared/       Zod schemas + DTOs (both sides)
├── .cursor/rules/    conventions the AI follows
├── render.yaml       one-service deploy
└── turbo.json        task graph`,
  },
  {
    id: "domain",
    eyebrow: "Organized by domain",
    title: "A feature is a folder, in layers",
    body: "Each domain owns its slice top to bottom — schema, repository, service, DTO, endpoints and agent tools. Import directions are enforced by lint, so the structure can't quietly rot as the app grows.",
    highlights: [
      "Repository = all SQL; every query filtered by tenantId",
      "service.ts only when there's real logic — CRUD skips it",
      "Boundaries fail the lint, not just code review",
      "@/ alias across layers; relative paths within a domain",
    ],
    filename: "apps/api/src/domains/task/",
    lang: "text",
    code: `domains/task/
├── schema.ts        Drizzle table
├── repository.ts    all SQL (scoped by tenantId)
├── service.ts       business logic (optional)
├── dto.ts           row → API shape
├── routes.ts        wires endpoints + middleware
├── endpoints/       create-task.endpoint.ts …
└── tools/           create-task.tool.ts … (agent)`,
  },
  {
    id: "endpoint",
    eyebrow: "Add an endpoint",
    title: "A new route is one file and one line",
    body: "Drop a handler in the domain's endpoints/ and register it in routes.ts, where auth and tenant middleware already run for the whole group. The handler stays thin: validate, hit the repository, map through the DTO.",
    highlights: [
      "Handler stays thin: validate → repository → DTO",
      "Auth + tenant middleware applied once in routes.ts",
      "Input validated by a shared Zod schema",
      "Tenant comes from context — one tenant can't touch another",
    ],
    filename: "domains/task/routes.ts",
    code: `const route = new Hono<AppEnv>();
route.use(requireAuth, requireTenant); // once for the group

route.get("/", listTasks);
route.post("/", createTask);
route.patch("/:id/archive", archiveTask); // ← new endpoint

export const taskRoutes = route;`,
  },
  {
    id: "tool",
    eyebrow: "Add an agent skill",
    title: "One file gives the agent a new tool",
    body: "A tool is a single defineTool — name, Zod input, execute. That one definition drives the in-app chat, local Cursor over stdio, and the remote MCP server, with zero extra glue.",
    highlights: [
      "Same definition drives the chat, stdio and remote MCP",
      "Zod input validates whatever the model sends",
      "summarize marks writes; reads leave it off",
      "Tools never import MCP or OpenAI — the lint blocks it",
    ],
    filename: "domains/task/tools/archive-task.tool.ts",
    code: `export const archiveTaskTool = defineTool({
  name: "archive_task",
  description: "Archives a task by id.",
  inputSchema: { id: z.string().uuid() },
  summarize: () => "Task archived", // write → chip in the chat
  execute: (ctx, { id }) => taskRepository.archive(ctx.tenantId, id),
});`,
  },
  {
    id: "schema",
    eyebrow: "Add a table",
    title: "Schema in the domain, migration from it",
    body: "Tables are TypeScript, defined with Drizzle inside their domain. Export from db/schema.ts and run db:generate — the SQL migration is derived from the schema, so code stays the source of truth.",
    highlights: [
      "Schema is code — migrations are generated, not hand-written",
      "Reused id + timestamp columns from a helper",
      "tenant_id foreign key cascades on delete",
      "db:generate locally, runs on pre-deploy in prod",
    ],
    filename: "domains/task/schema.ts",
    code: `export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    completed: boolean("completed").notNull().default(false),
    ...timestamps, // created_at / updated_at helper
  },
  (t) => [index("tasks_tenant_idx").on(t.tenantId)],
);`,
  },
  {
    id: "frontend",
    eyebrow: "The frontend",
    title: "A SPA that mirrors the API",
    body: "Same shape as the backend: one folder per domain with its pages, components and an api.ts — the only place that touches the network. Server state is TanStack Query, so a mutation invalidates and the screen refreshes itself.",
    highlights: [
      "Each domain: pages/ · components · api.ts · provider",
      "Network only through the domain api.ts — never raw fetch",
      "TanStack Query for server state; invalidate to refresh",
      "shadcn/ui + Tailwind; @/ alias everywhere",
    ],
    filename: "apps/web/src/domains/task/",
    lang: "text",
    code: `domains/task/
├── pages/TasksPage.tsx   route-level screen
├── task-list.tsx         domain component
├── api.ts                typed calls → @/lib/api
└── routes.tsx            <Route> group

// shared shell, outside domains:
// app/ · layouts/ · components/ui/ · lib/`,
  },
  {
    id: "rules",
    eyebrow: "Cursor rules",
    title: "The conventions live in the repo",
    body: "The patterns here are written as Cursor rules, scoped by glob so the right guidance loads for the file you edit. Ask the agent to add an endpoint and it already knows the layers, the names and where to register it.",
    highlights: [
      "api-structure — layers, boundaries, where to add things",
      "web-structure — folders, imports, the network boundary",
      "agent-tools — the transport-neutral tool contract",
      "language — English across code, UI and comments",
    ],
    filename: ".cursor/rules/",
    lang: "text",
    code: `.cursor/rules/
├── api-structure.mdc   globs: apps/api/**
├── web-structure.mdc   globs: apps/web/**
├── agent-tools.mdc     globs: **/*.tool.ts
└── language.mdc        alwaysApply

# each rule scoped by glob → loads for the file you edit`,
  },
  {
    id: "env",
    eyebrow: "Configuration",
    title: "Env vars, typed and validated",
    body: "One .env at the root, validated by a Zod schema at boot — a bad variable fails fast with a readable error. Optional keys degrade instead of crashing: no Resend key logs emails to the console, no OpenAI key hides the agent.",
    highlights: [
      "Validated once at boot, fails fast with a clear error",
      "Sensible local defaults — clone and run, no setup",
      "Optional keys degrade instead of crashing",
      "Code reads a typed env, never raw process.env",
    ],
    filename: ".env.example",
    lang: "text",
    code: `# API
PORT=5000
DATABASE_URL=postgres://app:app@localhost:5442/app_base
APP_URL=http://localhost:3000

# Email (without RESEND_API_KEY, emails are logged to the console)
RESEND_API_KEY=
MAIL_FROM=App Base <onboarding@resend.dev>

# Agent (without OPENAI_API_KEY the assistant button disappears)
OPENAI_API_KEY=
ASSISTANT_MODEL=gpt-4o-mini

# Turn off to operate invite-only
SELF_SIGNUP_ENABLED=true`,
  },
  {
    id: "deploy",
    eyebrow: "The deploy",
    title: "Commit the Blueprint, push, done",
    body: "The whole app ships as one Render web service plus Postgres, described in render.yaml. Migrations run on pre-deploy, a health check gates go-live, and secrets stay out of the repo with sync: false.",
    highlights: [
      "Single web service — API and SPA on one origin",
      "Migrations run on pre-deploy, not by hand",
      "Health check at /api/health for zero-downtime deploys",
      "Secrets kept out of the repo with sync: false",
    ],
    filename: "render.yaml",
    lang: "text",
    code: `services:
  - type: web
    name: app
    runtime: node
    buildCommand: npm ci --include=dev && npm run build
    startCommand: npm start
    preDeployCommand: npm run db:migrate
    healthCheckPath: /api/health

databases:
  - name: app-db
    plan: basic-256mb
    postgresMajorVersion: "16"`,
  },
];

const product = [
  {
    eyebrow: "Sign in",
    title: "Login, clean and familiar",
    body: "Email, password, a link to recovery, and secure sessions on submit — built with shadcn/ui, ready to rebrand.",
    mock: LoginMock,
  },
  {
    eyebrow: "Sign up",
    title: "Registration in seconds",
    body: "Name, email, password. Each new user gets a personal tenant and a verification email automatically.",
    mock: RegisterMock,
  },
  {
    eyebrow: "Email verification",
    title: "Confirm the address, then start",
    body: "A confirmation email goes out through Resend. The link is single-use and expires in 24 hours.",
    mock: VerifyEmailMock,
  },
  {
    eyebrow: "Password recovery",
    title: "Forgot password, handled",
    body: "Request a reset link by email, sent through Resend with a short-lived token that expires on its own.",
    mock: ForgotPasswordMock,
  },
  {
    eyebrow: "Password reset",
    title: "Set a new password safely",
    body: "The link opens a reset screen; the token is validated server-side, used once, and the password hashed with scrypt.",
    mock: ResetPasswordMock,
  },
  {
    eyebrow: "The app shell",
    title: "A workspace, not a blank page",
    body: "Sidebar nav, a tenant switcher that shows only with more than one, and a user menu. Your screens drop straight in.",
    mock: ShellMock,
  },
  {
    eyebrow: "Invite members",
    title: "Add teammates from settings",
    body: "Owners and admins type an email, pick a role, and send. Members and pending invites live right there, each revocable.",
    mock: InviteMembersMock,
  },
  {
    eyebrow: "The invite email",
    title: "The invite lands in their inbox",
    body: "An email with a 7-day link — accept it and the invitee lands in the tenant with the role you picked.",
    mock: InviteEmailMock,
  },
  {
    eyebrow: "The AI agent",
    title: "A chat that gets things done",
    body: "A floating assistant in every tenant: ask or command, it runs the right tools, shows what changed as a chip, and refreshes.",
    mock: AgentChatMock,
  },
  {
    eyebrow: "Bring your own tools",
    title: "The same tools, over MCP",
    body: "Mint a tenant-scoped API key and plug the remote MCP server into Cursor or Claude — the agent's tools, in your editor.",
    mock: McpKeysMock,
  },
] as const;

const stack = [
  { label: "Frontend", value: "React 19 · Vite · Tailwind · shadcn/ui · TanStack Query" },
  { label: "Backend", value: "Hono · Zod · Node" },
  { label: "Database", value: "PostgreSQL · Drizzle ORM" },
  { label: "AI", value: "OpenAI · Model Context Protocol (MCP)" },
  { label: "Tooling", value: "TypeScript · Turborepo · oxlint · Prettier" },
];

export function LandingPage() {
  const { me } = useAuth();
  const { selfSignupEnabled } = useAppConfig();
  useReveal();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <BoxIcon className="size-5" />
            App Base
          </Link>
          <nav className="flex items-center gap-2">
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
          <div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3 font-mono text-sm">
            <TerminalIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">$</span>
            <span>git clone app-base && npm install</span>
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" asChild>
              <Link to={me ? "/app" : selfSignupEnabled ? "/register" : "/login"}>
                {me ? "Go to app" : "Try the live demo"} <ArrowRightIcon />
              </Link>
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/40 px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">What's in the box</h2>
              <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
                The plumbing every product needs, already built and wired together.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {included.map((item) => (
                <Card key={item.title} className="reveal bg-background">
                  <CardContent className="p-6">
                    <item.icon className="mb-3 size-6" />
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pt-20 pb-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">What your users get</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Not just endpoints — real product surfaces, designed and working out of the box.
          </p>
        </section>

        {product.map((item, i) => {
          const Mock = item.mock;
          const flip = i % 2 === 1;
          return (
            <section key={item.title} className="px-4 py-10 sm:py-12">
              <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
                <div className={`reveal ${flip ? "lg:order-2" : ""}`}>
                  <p className="text-sm font-medium text-muted-foreground">{item.eyebrow}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-pretty text-muted-foreground">{item.body}</p>
                </div>
                <div className={`reveal reveal-delay ${flip ? "lg:order-1" : ""}`}>
                  <Mock />
                </div>
              </div>
            </section>
          );
        })}

        <section className="mx-auto w-full max-w-5xl px-4 pt-20 pb-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">How it's built</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            The shape of the codebase and how you extend it — the workspace, the domains, and where
            a new endpoint, tool or table actually goes.
          </p>
        </section>

        {showcases.map((showcase, i) => (
          <ShowcaseSection key={showcase.id} showcase={showcase} flip={i % 2 === 1} />
        ))}

        <section className="border-t bg-muted/40 px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight">A stack you already know</h2>
              <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
                Boring, well-documented tools — nothing exotic to learn before you're productive.
              </p>
            </div>
            <dl className="mx-auto mt-10 max-w-2xl divide-y rounded-lg border bg-background">
              {stack.map((s) => (
                <div key={s.label} className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:gap-8">
                  <dt className="w-28 shrink-0 font-medium">{s.label}</dt>
                  <dd className="text-muted-foreground">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-24 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Clone it and start building</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Skip the boilerplate and go straight to the part that's actually your product.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link to={me ? "/app" : selfSignupEnabled ? "/register" : "/login"}>
              {me ? "Go to app" : "Try the live demo"} <ArrowRightIcon />
            </Link>
          </Button>
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

/** One section per pattern: the reasoning on one side, the real file on the other. */
function ShowcaseSection({ showcase, flip }: { showcase: Showcase; flip: boolean }) {
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto grid max-w-5xl items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <div className={`reveal ${flip ? "lg:order-2" : ""}`}>
          <p className="text-sm font-medium text-muted-foreground">{showcase.eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {showcase.title}
          </h3>
          <p className="mt-4 text-pretty text-muted-foreground">{showcase.body}</p>
          <ul className="mt-6 space-y-2.5 text-sm">
            {showcase.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2.5">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`reveal reveal-delay lg:sticky lg:top-24 ${flip ? "lg:order-1" : ""}`}>
          <CodeBlock filename={showcase.filename} code={showcase.code} lang={showcase.lang} />
        </div>
      </div>
    </section>
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
