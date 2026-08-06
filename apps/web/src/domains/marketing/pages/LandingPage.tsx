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
  /** One or more paragraphs of narrative copy. */
  body: string[];
  /** Concrete technical points shown below the copy. */
  highlights: string[];
  filename: string;
  code: string;
  lang?: "ts" | "json" | "text";
};

const showcases: Showcase[] = [
  {
    id: "auth",
    eyebrow: "Authentication",
    title: "Sessions you own, end to end",
    body: [
      "Instead of leaning on an auth SaaS, the base implements the whole thing in a few small files. Sign-up creates a user with a scrypt-hashed password; login mints an opaque token, stores its hash in the database and sets it in an httpOnly cookie. There's no JWT to leak and nothing to revoke remotely — deleting the row logs the session out.",
      "The same service issues short-lived action tokens for email verification and password reset, each hashed at rest with its own TTL. A single requireAuth middleware turns the cookie back into a typed user for every protected route.",
    ],
    highlights: [
      "Opaque session token, only its hash stored (30-day TTL)",
      "httpOnly + SameSite=Lax cookie, secure in production",
      "Action tokens for verify/reset, hashed with per-purpose expiry",
      "requireAuth injects the user into the typed context",
    ],
    filename: "domains/auth/service.ts",
    code: `export const SESSION_COOKIE = "app_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  await authRepository.insertSession({
    tokenHash: hashToken(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return token;
}

export function setSessionCookie(c: Context, token: string): void {
  setCookie(c, SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    secure: env.isProduction,
    maxAge: SESSION_TTL_MS / 1000,
  });
}`,
  },
  {
    id: "tenant",
    eyebrow: "Multi-tenancy",
    title: "Isolation that starts at the middleware",
    body: [
      "Every tenant-scoped route sits behind requireTenant. It reads the :tenantId from the URL, confirms the logged-in user is actually a member, and puts the resolved tenant and membership on the context. Handlers then read c.get(\"tenant\").id — never a tenant id from the request body — so there's no path for one tenant to touch another's data.",
      "Roles ride along the same way: requireManager checks the membership already loaded, so an authorization rule is one middleware in the route definition, not a check scattered across handlers.",
    ],
    highlights: [
      "Membership verified before any handler runs",
      "tenant_id always comes from the context, never the body",
      "Roles (owner/admin/member) enforced by requireManager",
      "A personal tenant is created for every new user",
    ],
    filename: "domains/tenant/middleware.ts",
    code: `export const requireTenant = createMiddleware<AppEnv>(async (c, next) => {
  const tenantId = c.req.param("tenantId");
  if (!tenantId || !UUID_RE.test(tenantId)) throw new HttpError(404, "Tenant not found");

  const row = await tenantRepository.findTenantWithMembership(tenantId, c.get("user").id);
  if (!row) throw new HttpError(404, "Tenant not found");

  c.set("tenant", row.tenant);
  c.set("membership", row.membership);
  await next();
});`,
  },
  {
    id: "agent",
    eyebrow: "The AI agent",
    title: "Give the agent a new skill in one file",
    body: [
      "The floating assistant doesn't just chat — it calls tools that read and write real tenant data. Each tool lives inside its domain and declares a name, a Zod input schema and an execute function. The contract is transport-neutral: it returns plain JSON and throws on expected failures.",
      "That one definition is exposed two ways without extra code — over the Model Context Protocol and through the OpenAI tool-calling loop. A summarize field marks a tool as a write, which the chat renders as an action chip and uses to refresh the screen afterward. Drop a file in tools/, and the agent can use it.",
    ],
    highlights: [
      "One file per tool, co-located with its domain",
      "Same definition drives both MCP and the OpenAI loop",
      "Zod input schema validates the model's arguments",
      "summarize marks writes; reads omit it",
    ],
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
    id: "email",
    eyebrow: "Transactional email",
    title: "One function, safe in every environment",
    body: [
      "Domains never talk to an email provider directly — they call sendEmail with a subject and HTML. The Resend integration is the only place that knows the API, so swapping providers is a single file change.",
      "Without a RESEND_API_KEY, sendEmail logs the whole message to the console instead of sending it, so local development never risks a real inbox and you can still click the verification link from the terminal. Sends are fire-and-forget, so the HTTP response never waits on the provider.",
    ],
    highlights: [
      "Verification, password reset and tenant invites included",
      "Provider isolated — domains only call sendEmail",
      "No API key? It logs to the console instead of sending",
      "Fire-and-forget so requests don't block on email",
    ],
    filename: "integrations/resend.ts",
    code: `export async function sendEmail({ to, subject, html }: EmailPayload): Promise<void> {
  if (!env.resendApiKey) {
    logger.info(\`\\n[email] (dev, not sent) to: \${to}\\n[email] subject: \${subject}\\n\${html}\\n\`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${env.resendApiKey}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: env.mailFrom, to, subject, html }),
  });
  // ...log the resend id or the failure
}`,
  },
  {
    id: "structure",
    eyebrow: "The structure",
    title: "A place for everything, enforced by lint",
    body: [
      "Features live in domains/, pure helpers in lib/, external services in integrations/, and the agent surface in agent/. The frontend mirrors the same shape. Files are named by role — create-note.endpoint.ts, create-note.tool.ts — so you can guess a path before opening the folder.",
      "These aren't just conventions in a README. oxlint's no-restricted-imports rules make the boundaries real: lib/ can't import a domain, a domain can't reach into the agent's internals or import OpenAI directly. The architecture can't quietly rot as the app grows.",
    ],
    highlights: [
      "domains/ · lib/ · integrations/ · agent/ — one job each",
      "Files named by role: *.endpoint.ts, *.tool.ts",
      "Frontend mirrors the API, domain for domain",
      "Import boundaries fail the lint, not just code review",
    ],
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
    id: "deploy",
    eyebrow: "The deploy",
    title: "Commit the Blueprint, push, done",
    body: [
      "The whole app ships as one Render web service plus a Postgres database, both described in render.yaml. In production the API serves the built SPA from the same origin, so cookies stay simple and there's no CORS to configure.",
      "Migrations run automatically as a pre-deploy step, a health check tells Render when the service is live, and secrets are marked sync: false so they never live in the repo. Point Render at your fork and the first deploy just works.",
    ],
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
      <div className="mx-auto grid max-w-5xl items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <div className={`reveal ${flip ? "lg:order-2" : ""}`}>
          <p className="text-sm font-medium text-muted-foreground">{showcase.eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {showcase.title}
          </h3>
          <div className="mt-4 space-y-3 text-pretty text-muted-foreground">
            {showcase.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
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
