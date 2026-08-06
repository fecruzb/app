import { useEffect, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  BoxIcon,
  CheckIcon,
  EraserIcon,
  MoonIcon,
  PaletteIcon,
  PenLineIcon,
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
  flows,
  LoginMock,
  McpKeysMock,
  ShellMock,
  TasksMock,
  WindowBar,
  type Screen,
} from "../product-preview";

type Included = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

type Step = {
  id: string;
  title: string;
  /** A single short paragraph — keep it tight. */
  body: string;
  /** Concrete technical points shown below the copy. */
  points: string[];
  filename: string;
  code: string;
  lang?: "ts" | "json" | "text";
};

type Phase = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  steps: Step[];
};

// The whole code story as one chronology: run it, add a feature end to end,
// ship it. The "notes" feature in phase two follows the repo's real patterns.
const journey: Phase[] = [
  {
    id: "start",
    eyebrow: "Phase 1",
    title: "Day zero — get it running, learn the map",
    description:
      "Before writing any code, get the app on your screen and learn the lay of the land. Fifteen minutes, and you'll know where everything lives.",
    steps: [
      {
        id: "run",
        title: "Clone and run",
        body: "Start here. One command boots Postgres in Docker, applies the migrations and seeds a demo workspace; the next starts both dev servers. There's nothing to configure first — the .env ships with working local defaults, validated by Zod at boot, and optional keys degrade gracefully: no Resend key logs emails to the console, no OpenAI key just hides the agent.",
        points: [
          "Env validated once at boot — a bad var fails fast",
          "Optional keys degrade: email → console, agent → hidden",
          "Code reads a typed env, never raw process.env",
        ],
        filename: "terminal",
        lang: "text",
        code: `git clone <your-fork>/app-base && cd app-base
npm install

npm run setup    # Postgres via Docker + migrate + seed
npm run dev      # API on :5000 · SPA on :3000`,
      },
      {
        id: "workspace",
        title: "Meet the workspace",
        body: "Now take a minute to walk the tree. It's one typed monorepo wired with npm workspaces and Turborepo: the Hono API, the React SPA, and a shared package of Zod schemas both sides import. That shared package is the trick — change a request shape there and whichever side you forgot stops compiling.",
        points: [
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
        title: "A feature is a folder",
        body: "Last stop on the tour: open apps/api/src/domains/task/ — this is the folder you'll copy for everything you build. A domain owns its slice top to bottom (schema, repository, DTO, endpoints, agent tools), and the frontend mirrors the same shape. Import directions are enforced by lint, so the structure can't quietly rot as the app grows.",
        points: [
          "Repository = all SQL; every query filtered by tenantId",
          "service.ts only when there's real logic — CRUD skips it",
          "Boundaries fail the lint, not just code review",
        ],
        filename: "apps/api/src/domains/task/",
        lang: "text",
        code: `domains/task/
├── schema.ts        Drizzle table
├── repository.ts    all SQL (scoped by tenantId)
├── dto.ts           row → API shape
├── routes.ts        wires endpoints + middleware
├── endpoints/       create-task.endpoint.ts …
└── tools/           create-task.tool.ts … (agent)

// apps/web mirrors it: domains/task/
//   api.ts · pages/TasksPage.tsx · routes.tsx`,
      },
    ],
  },
  {
    id: "feature",
    eyebrow: "Phase 2",
    title: "The loop — build a feature with us, end to end",
    description:
      "Time to build. Say your product needs notes: create domains/note/ and walk the same path every feature takes — six small files, each landing exactly where the last one predicted. This is the loop you'll repeat for the rest of the product's life.",
    steps: [
      {
        id: "contract",
        title: "Declare the contract",
        body: "Always start with the shape. Create note.ts in the shared package and declare two things: the input schema the API will validate with, and the DTO the frontend will consume. One definition, imported by both sides — there is no second version to keep in sync.",
        points: [
          "One schema validates the request and types the client",
          "Both sides import it — drift is a compile error",
        ],
        filename: "packages/shared/src/note.ts",
        code: `export const noteInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export type NoteDto = {
  id: string;
  title: string;
  createdAt: string;
};`,
      },
      {
        id: "table",
        title: "Add the table",
        body: "Next, storage. Define the table in TypeScript with Drizzle, inside the domain — note the tenant_id foreign key that ties every note to its workspace. Export it from db/schema.ts, then run npm run db:generate: the SQL migration is derived from your code, so the schema stays the source of truth.",
        points: [
          "Migrations are generated, not hand-written",
          "tenant_id foreign key cascades on delete",
          "Reused id + timestamp columns from a helper",
        ],
        filename: "domains/note/schema.ts",
        code: `export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    ...timestamps, // created_at / updated_at helper
  },
  (t) => [index("notes_tenant_idx").on(t.tenantId)],
);

// npm run db:generate  → SQL migration from the schema`,
      },
      {
        id: "repository",
        title: "Write the queries",
        body: "Now the data access. All SQL for the domain lives in one repository object, and every method takes tenantId and filters by it — isolation isn't a code-review reminder here, it's the only way the data can be reached at all. Stick to the naming (list / find / insert / update / delete) and the rest of the stack knows what to expect.",
        points: [
          "CRUD methods named list / find / insert / update / delete",
          "No query exists without a tenant filter",
        ],
        filename: "domains/note/repository.ts",
        code: `export const noteRepository = {
  async list(tenantId: string): Promise<Note[]> {
    return db
      .select()
      .from(notes)
      .where(eq(notes.tenantId, tenantId))
      .orderBy(desc(notes.createdAt));
  },

  async insert(values: { tenantId: string; title: string }): Promise<Note> {
    const [note] = await db.insert(notes).values(values).returning();
    return note;
  },
};`,
      },
      {
        id: "endpoint",
        title: "Expose the endpoint",
        body: "Wire it to HTTP. The handler stays three lines of intent — parse the body with the shared schema, call the repository, map through the DTO — then gets one line in routes.ts. Auth and tenant middleware already run for the whole group, so the handler never checks a session or resolves a tenant itself.",
        points: [
          "Handler stays thin: validate → repository → DTO",
          "Tenant comes from context — one tenant can't touch another",
        ],
        filename: "domains/note/endpoints/create-note.endpoint.ts",
        code: `export async function createNote(c: AppContext) {
  const data = await parseBody(c, noteInputSchema);
  const note = await noteRepository.insert({
    tenantId: c.get("tenant").id,
    title: data.title,
  });
  return c.json(toNoteDto(note), 201);
}

// routes.ts — middleware applied once for the group
export const noteRoutes = new Hono<AppEnv>()
  .use("*", requireAuth, requireTenant)
  .get("/", listNotes)
  .post("/", createNote); // ← the new endpoint`,
      },
      {
        id: "tool",
        title: "Teach the agent",
        body: "One more file and the AI catches up with you. A tool is a single defineTool — name, Zod input, execute — that reuses the repository you just wrote. That one definition drives the in-app chat, local Cursor over stdio and the remote MCP server, with zero extra glue.",
        points: [
          "Same definition drives the chat, stdio and remote MCP",
          "summarize marks writes — it becomes a chip in the chat",
          "Tools never import MCP or OpenAI — the lint blocks it",
        ],
        filename: "domains/note/tools/create-note.tool.ts",
        code: `export const createNoteTool = defineTool({
  name: "create_note",
  description: "Creates a note in the tenant.",
  inputSchema: {
    title: z.string().trim().min(1).max(200),
  },
  summarize: (args) => \`Note created: \${args.title}\`,
  execute: (ctx, { title }) =>
    noteRepository.insert({ tenantId: ctx.tenantId, title }),
});`,
      },
      {
        id: "frontend",
        title: "Build the screen",
        body: "Finally, the UI. Mirror the domain on the frontend: an api.ts with the typed calls — the only file that touches the network — and a page built on the TanStack Query template. Reads are queries, writes are mutations that invalidate on success; you never hand-manage a loading flag.",
        points: [
          "Network only through the domain api.ts — never raw fetch",
          "Reads are queries, writes invalidate — no manual loading state",
        ],
        filename: "apps/web/src/domains/note/",
        code: `// api.ts — typed calls, the only network boundary
export const noteApi = {
  list: (tenantId: string) =>
    api.get<NoteDto[]>(\`/tenants/\${tenantId}/notes\`),
  create: (tenantId: string, body: { title: string }) =>
    api.post<NoteDto>(\`/tenants/\${tenantId}/notes\`, body),
};

// pages/NotesPage.tsx — server state via TanStack Query
const notes = useQuery({
  queryKey: ["notes", tenant.id],
  queryFn: () => noteApi.list(tenant.id),
});`,
      },
    ],
  },
  {
    id: "ship",
    eyebrow: "Phase 3",
    title: "Ship it — and shortcut the next one",
    description:
      "The feature is done; getting it to production is a push. And because the path you just walked is written down as rules, the next feature can be a prompt instead of six files.",
    steps: [
      {
        id: "deploy",
        title: "Push to deploy",
        body: "No deploy scripts to write — render.yaml already describes production: one Render web service running the API and serving the SPA, plus Postgres. Commit your feature and push. Migrations run on pre-deploy (your notes table included) and a health check gates go-live.",
        points: [
          "Single web service — API and SPA on one origin",
          "Migrations run on pre-deploy, not by hand",
          "Secrets stay out of the repo with sync: false",
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
      {
        id: "rules",
        title: "Next time, just ask",
        body: "Here's the payoff of all that convention: every step you just did by hand is written down as a Cursor rule, scoped by glob to the files it governs. The agent reads the same playbook you just learned — so it can walk phase two for you, same files, same names, same conventions.",
        points: [
          "api-structure — layers, boundaries, where things go",
          "web-structure — folders, imports, the network boundary",
          "agent-tools — the transport-neutral tool contract",
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
    ],
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
    eyebrow: "Example resource",
    title: "A full CRUD feature to copy",
    body: "Tasks is the placeholder feature — per-tenant create, list, toggle and delete, wired end to end. It's the exact shape you'll clone for your own resources, then delete.",
    mock: TasksMock,
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
      "The conventions are markdown files in .cursor/rules/. Disagree with one? Edit it, and the agent starts following you instead.",
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

        <section className="border-t px-4 pt-20 pb-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">The product tour</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              An app that's already assembled
            </h2>
            <p className="mx-auto mt-3 text-pretty text-muted-foreground">
              Not a pile of endpoints — a running app with a database, a themeable UI and the
              screens a real product needs. Here's the tour, in the order you'd meet them: sign in,
              get set up, then step into the workspace and everything it ships with.
            </p>
          </div>
        </section>

        {chapters.slice(0, 4).map((chapter, i) => (
          <ChapterSection key={chapter.title} chapter={chapter} flip={i % 2 === 1} />
        ))}

        <ThemingSection />

        {chapters.slice(4).map((chapter, i) => (
          <ChapterSection key={chapter.title} chapter={chapter} flip={i % 2 === 0} />
        ))}

        <section id="build" className="scroll-mt-16 border-t px-4 pt-20 pb-8">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight">From clone to production</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              A guided build, start to finish: run the project, add a real feature — notes — layer
              by layer, then push it live. Each step shows the exact file you'd write and ends with
              something you can check.
            </p>
          </div>
        </section>

        {journey.map((phase, phaseIndex) => (
          <PhaseSection
            key={phase.id}
            phase={phase}
            startAt={journey.slice(0, phaseIndex).reduce((n, p) => n + p.steps.length, 0)}
          />
        ))}

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
        <div className="grid">
          {screens.map((screen, i) => {
            const Body = screen.Body;
            return (
              <div
                key={i}
                aria-hidden={i !== index}
                className={`col-start-1 row-start-1 transition-opacity duration-500 ${
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

/** One phase of the chronology: a heading plus its numbered steps on a timeline. */
function PhaseSection({ phase, startAt }: { phase: Phase; startAt: number }) {
  return (
    <section className="px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="reveal mb-10 max-w-2xl">
          <p className="text-sm font-medium text-primary">{phase.eyebrow}</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{phase.title}</h3>
          <p className="mt-2 text-pretty text-muted-foreground">{phase.description}</p>
        </div>
        <ol className="relative space-y-14 border-l pl-8 sm:pl-10">
          {phase.steps.map((step, i) => (
            <StepItem key={step.id} step={step} number={startAt + i + 1} />
          ))}
        </ol>
      </div>
    </section>
  );
}

/** One step: the number on the timeline, the reasoning, and the file it produces. */
function StepItem({ step, number }: { step: Step; number: number }) {
  return (
    <li className="relative">
      <span className="absolute top-0.5 -left-11 flex size-6 items-center justify-center rounded-full border bg-background text-xs font-medium sm:-left-13">
        {number}
      </span>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,5fr)] lg:gap-12">
        <div className="reveal min-w-0">
          <h4 className="text-lg font-semibold tracking-tight text-balance">{step.title}</h4>
          <p className="mt-2.5 text-sm text-pretty text-muted-foreground">{step.body}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {step.points.map((point) => (
              <li key={point} className="flex gap-2.5">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal reveal-delay min-w-0">
          <CodeBlock filename={step.filename} code={step.code} lang={step.lang} />
        </div>
      </div>
    </li>
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
