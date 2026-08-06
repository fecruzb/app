import { useEffect, type ComponentType } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  BoxIcon,
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
      "Sign-up, login, password reset and email verification. Own it — no auth vendor, scrypt hashing, sessions in an httpOnly cookie.",
  },
  {
    icon: UsersIcon,
    title: "Multi-tenancy",
    description:
      "A personal tenant per user, invites, roles (owner/admin/member) and every query scoped by tenant_id so data never leaks.",
  },
  {
    icon: SparklesIcon,
    title: "AI agent",
    description:
      "A floating assistant wired to your data through MCP tools. Define a tool in a domain and it can call it — no glue code.",
  },
  {
    icon: MailIcon,
    title: "Transactional email",
    description:
      "Resend over HTTP behind one swappable module, with a dev fallback that logs to the console so nothing leaks.",
  },
  {
    icon: LayersIcon,
    title: "Domain architecture",
    description:
      "Front and back organized by domain with layered boundaries enforced by lint — a shape that scales past the demo.",
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
  body: string;
  filename: string;
  code: string;
  lang?: "ts" | "json" | "text";
};

const showcases: Showcase[] = [
  {
    id: "agent",
    eyebrow: "The AI agent",
    title: "Give the agent a new skill in one file",
    body: "Tools live inside their domain and are transport-neutral — the same definition is exposed over MCP and driven by the OpenAI loop. Return JSON, throw on errors; the chat UI and the model adapt at the edges. Add a file, restart, and the assistant can use it.",
    filename: "domains/note/tools/create-note.tool.ts",
    code: `export const createNoteTool = defineTool({
  name: "create_note",
  description: "Creates a note in the tenant.",
  inputSchema: {
    title: z.string().trim().min(1).max(200),
    content: z.string().max(20000).default(""),
  },
  summarize: (args) => \`Note created: \${args.title}\`,
  execute: async (ctx, { title, content }) => {
    const note = await noteRepository.insert({
      tenantId: ctx.tenantId,
      authorId: ctx.userId,
      title,
      content,
    });
    return { id: note.id, title: note.title };
  },
});`,
  },
  {
    id: "structure",
    eyebrow: "The structure",
    title: "A place for everything, enforced by lint",
    body: "Features live in domains/. Pure helpers in lib/, external services in integrations/, the agent surface in agent/. The frontend mirrors it. These aren't just conventions — oxlint rules stop lib/ from importing a domain, or a domain from importing OpenAI directly.",
    filename: "apps/",
    lang: "text",
    code: `apps/
├── api/src/
│   ├── domains/{auth,tenant,note}/
│   │   ├── *.endpoint.ts   HTTP handlers
│   │   ├── *.tool.ts       agent tools
│   │   ├── repository.ts   service.ts
│   │   └── schema.ts       routes.ts
│   ├── integrations/       openai · resend
│   ├── agent/              assistant · mcp · registry
│   └── lib/                pure utilities
└── web/src/
    └── domains/{auth,tenant,note,marketing}/`,
  },
  {
    id: "endpoint",
    eyebrow: "The API",
    title: "Endpoints stay boring on purpose",
    body: "One handler per file. Body validated by a shared Zod schema, tenant and user already resolved by middleware and read from the typed context, data mapped to a DTO before it leaves. No controllers, no decorators — just a typed function.",
    filename: "domains/note/endpoints/create-note.endpoint.ts",
    code: `export async function createNote(c: AppContext) {
  const data = await parseBody(c, noteInputSchema);
  const note = await noteRepository.insert({
    tenantId: c.get("tenant").id,
    authorId: c.get("user").id,
    title: data.title,
    content: data.content,
  });
  return c.json(toNoteDto({ note, authorName: c.get("user").name }), 201);
}`,
  },
  {
    id: "deploy",
    eyebrow: "The deploy",
    title: "Commit the Blueprint, push, done",
    body: "The whole app is one Render web service plus a Postgres database, described in render.yaml. Migrations run on pre-deploy, health checks are wired, and secrets stay out of the repo. Point it at your repo and the first deploy just works.",
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

        <section className="mx-auto w-full max-w-5xl px-4 pt-16 pb-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">See how it's built</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Real code from the repo — the patterns you'll extend, not marketing screenshots.
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
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className={`reveal ${flip ? "lg:order-2" : ""}`}>
          <p className="text-sm font-medium text-muted-foreground">{showcase.eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {showcase.title}
          </h3>
          <p className="mt-4 text-pretty text-muted-foreground">{showcase.body}</p>
        </div>

        <div className={`reveal reveal-delay ${flip ? "lg:order-1" : ""}`}>
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
