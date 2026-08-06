# app-base

Multi-tenant SaaS app template, ready to become a new product. Comes with users, complete authentication, tenants with members and invites, transactional emails, a public site and deploy on Render.

## Stack

| Layer    | Technology                                                                   |
| -------- | ---------------------------------------------------------------------------- |
| Frontend | React 19 + Vite, Tailwind CSS v4, shadcn/ui, react-router v7, TanStack Query |
| API      | Hono + Zod (Node)                                                            |
| Database | PostgreSQL 16 + Drizzle ORM (migrations with drizzle-kit)                    |
| Auth     | Opaque DB session + httpOnly cookie (password with native scrypt, zero deps) |
| Email    | Resend over HTTP (no key: logs to the console in dev)                        |
| Monorepo | npm workspaces + Turborepo · lint with oxlint · format with Prettier         |

In production the API serves the built SPA — **one origin, a single service**, simple cookies.

## Running locally

Prerequisites: Node ≥ 22, Docker.

```bash
git clone https://github.com/fecruzb/app && cd app
npm install
npm run setup   # starts Postgres (Docker), runs migrations and seed
npm run dev     # API on :5000 + web on :3000 (proxies /api)
```

Open http://localhost:3000 and sign in with the demo user: `demo@example.com` / `demo1234`.

Without `RESEND_API_KEY`, emails (verification, password reset, invites) are logged to the API console — copy the link from there to test the flows.

## What's already included

- **Auth**: sign-up, login, logout, password recovery, email verification, password change (ends other sessions)
- **Multi-tenant**: every user gets a personal tenant (no manual creation); joins others only by invite. The tenant switcher only appears when belonging to 2+. Roles `owner` / `admin` / `member` and data isolation via middleware
- **Invites**: by email, accepted with an existing account or by creating one on the spot
- **Public site**: landing with CTAs + auth screens, separate from the logged-in area
- **Example resource**: `tasks` — a per-tenant to-do list, end to end (schema → route → page)
- **Agent + MCP**: a floating button in the app opens a chat with an assistant (OpenAI) that runs the MCP tools in the tenant context. The same tools are exposed two more ways: over stdio for local dev (`npm run mcp`, registered in `.cursor/mcp.json`) and over HTTP as a **remote MCP server** (`POST /api/mcp`) authenticated by a personal API key
- **API keys**: users mint tenant-scoped keys in _My account_ and plug the remote MCP server into Cursor (or any MCP client) to drive the app from their editor
- **`SELF_SIGNUP_ENABLED` flag**: turn off to operate invite-only

## Structure

The API is organized by **domain**: each domain groups its database schema, repository (all SQL), business rules, one file per route and the agent tools.

```
apps/api/src/
├── app.ts                # builds the Hono app (middlewares + routes + SPA + health/config) — "the API"
├── server.ts             # HTTP entrypoint: starts the server
├── context.ts            # typed request context (user/tenant/membership from middlewares)
├── agent/                # agent surface (not a domain): assistant (policy), registry,
│                         # mcp-server (adapter), tool (contract), mcp (stdio entry),
│                         # mcp-http (remote MCP over HTTP, API-key auth), routes/
├── lib/                  # pure utilities (no app dependency): env (validated at boot),
│                         # crypto, logger, errors, email layout
├── integrations/         # external service wrappers: openai (client + tool loop), resend
├── domains/
│   ├── auth/             # schema, repository, service, dto, emails, middleware, routes/
│   ├── account/          # routes/ (profile, password)
│   ├── tenant/           # tenants + members + invites: schema, repository, service,
│   │                     # emails, middleware, routes/, tools/
│   └── task/             # example resource (to-do list): schema, repository, dto, routes/, tools/
└── db/                   # client, schema.ts (barrel for drizzle-kit), columns (audit), seed

apps/web                  # React SPA (public pages + logged-in area)
packages/shared           # Zod schemas and DTOs per domain (auth, tenant, task, agent)
```

Conventions:

- **One route per file** in `domains/<domain>/routes/`, named `<action>.route.ts` (e.g. `create-task.route.ts`); `routes/index.ts` is the method + path + middlewares map (same role as `tools/index.ts`).
- **One tool per file** in `domains/<domain>/tools/`, named `<action>.tool.ts` (e.g. `create-task.tool.ts`); the tool is self-describing (`summarize` marks a write and becomes a chip in the chat UI). Register the domain's array in `agent/registry.ts`.
- **Tools are transport-neutral**: they return JSON-serializable data and throw `Error` for expected failures. `agent/mcp-server.ts` translates to MCP; `agent/assistant.ts` translates to the OpenAI loop. Domains never import MCP/OpenAI (lint blocks it).
- **Name suffix = file role.** Single-role domain files keep the role name (`repository.ts`, `service.ts`, `schema.ts`); folders own their index (`routes/index.ts`, `tools/index.ts`); action files carry the `.route.ts` / `.tool.ts` suffix.
- **The repository owns the SQL** — routes and services don't write queries. Every resource query filters by `tenantId`.
- **Service only when there's real business logic** (sessions, tokens, invites…). Plain CRUD calls the repository straight from the route/tool — that's why `task` has no `service.ts` while `auth`/`tenant` do. Once an operation gains a rule, create the service and route the HTTP handler and tool through it.
- **Tenant isolation is safe by default** — each tenant-scoped domain's `routes/index.ts` applies `requireAuth`/`requireTenant` once (via `.use`), so every new route is isolated from the start.
- **New table?** Export the domain schema in `db/schema.ts` (the barrel drizzle-kit reads) and run `db:generate`.
- **Env is validated at boot** (`lib/env.ts`, Zod): a missing required variable kills the process with a clear message instead of breaking on a query. Add new vars to that schema.
- **Imports use the `@/` alias** (→ `apps/api/src/`): anything crossing a boundary uses the alias — `@/lib/*`, `@/integrations/*`, `@/db/*`, `@/domains/<other>/*`. Only imports within the same domain stay relative (`./repository`, `../service`). This way moving files doesn't break imports and `../../../` disappears.
- **Boundaries are enforced by lint** (`.oxlintrc.json`, `no-restricted-imports`): `lib/` can't depend on anything in the app; `integrations/` only on `lib/`; domains only know the agent contract (`@/agent/tool`) and never MCP/OpenAI directly. Cross the line and `npm run lint` flags it.
- **The agent is its own surface** (`agent/`), not a domain: it _consumes_ the domains via `registry.ts` (which joins each domain's `tools/`). It has two layers: the _policy_ (`agent/assistant.ts` — who the agent is and how it acts) and the _mechanics_ (`integrations/openai.ts` — OpenAI client + the tool-calling loop). The same registry is exposed three ways from one place: the in-app chat (OpenAI loop), stdio (`agent/mcp.ts`, local Cursor) and HTTP (`agent/mcp-http.ts`, remote clients authenticated by an API key).

Useful entry points:

- `apps/api/src/app.ts` — all routes mounted in one place
- `apps/api/src/domains/task/` + `apps/web/src/domains/task/pages/TasksPage.tsx` — a complete domain to copy
- `apps/api/src/domains/tenant/middleware.ts` — tenant isolation
- `apps/api/src/agent/registry.ts` — tools available to the agent and MCP
- `apps/web/src/app/App.tsx` — SPA route map

## Deriving a new product

1. Clone/copy this repo and rename it (`package.json`, `index.html`, "App Base" text, `render.yaml`)
2. Replace the `tasks` resource with your domain: copy `apps/api/src/domains/task/` (schema → repository → routes → tools), export the schema in `db/schema.ts`, run `db:generate`, add the schemas to `packages/shared` and the page in web
3. Adjust the landing (`apps/web/src/domains/marketing/pages/LandingPage.tsx`)
4. Set `RESEND_API_KEY` and `MAIL_FROM` for real emails
5. Deploy: push the repo to GitHub and create a Blueprint on Render pointing to `render.yaml`

## Environment variables

Copy `.env.example` to `.env` at the root (in production Render injects everything):

| Var                   | Description                                                                    |
| --------------------- | ------------------------------------------------------------------------------ |
| `DATABASE_URL`        | Postgres (default points to the local Docker)                                  |
| `APP_URL`             | Public URL used in email links (falls back to `RENDER_EXTERNAL_URL` on Render) |
| `RESEND_API_KEY`      | Optional — without it, emails are logged to the console                        |
| `MAIL_FROM`           | Sender, e.g. `My App <no-reply@myapp.com>`                                     |
| `OPENAI_API_KEY`      | Optional — without it the agent is disabled                                    |
| `ASSISTANT_MODEL`     | Agent model (default `gpt-4o-mini`)                                            |
| `SELF_SIGNUP_ENABLED` | `false` to turn off public sign-up                                             |

## Connect an MCP client (remote)

The API exposes a remote MCP server at `POST /api/mcp`, authenticated by a personal API key. Create a key in **My account → API keys** (it's scoped to one tenant and shown only once), then add it to your MCP client. For Cursor, in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "app-base": {
      "url": "https://your-app.onrender.com/api/mcp",
      "headers": { "Authorization": "Bearer abk_..." }
    }
  }
}
```

The client gets the same tools as the in-app agent, acting on that key's tenant. Revoke a key from the same screen to cut access. (For local development against your own machine, `npm run mcp` runs the stdio server instead — no key needed.)

## Scripts

| Command                                 | Does                           |
| --------------------------------------- | ------------------------------ |
| `npm run dev`                           | API + web in watch             |
| `npm run build`                         | Production build (web)         |
| `npm start`                             | API in production (serves SPA) |
| `npm run db:generate`                   | Generate migration from schema |
| `npm run db:migrate`                    | Apply migrations               |
| `npm run db:seed`                       | Demo user                      |
| `npm run lint` / `format` / `typecheck` | Quality                        |
