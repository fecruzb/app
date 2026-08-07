# app-base

Multi-tenant SaaS app template, ready to become a new product. Comes with users, complete authentication, tenants with members and invites, plans & seat/AI entitlements (billing skeleton), platform admin, transactional emails, a public site and deploy on Render.

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

Open http://localhost:3000 and sign in with `demo@example.com`. Set `SEED_DEMO_PASSWORD` in your `.env` before seeding, or read the password from `apps/api/.seed-demo-password` after `npm run db:seed` (gitignored — never printed).

Without `RESEND_API_KEY`, emails (verification, password reset, invites) are logged to the API console — copy the link from there to test the flows.

## What's already included

- **Auth**: sign-up, login, logout, password recovery, email verification, password change (ends other sessions)
- **Multi-tenant**: every user gets a personal tenant (no manual creation); joins others only by invite. The tenant switcher only appears when belonging to 2+. Roles `owner` / `admin` / `member` and data isolation via middleware
- **Invites**: by email, accepted with an existing account or by creating one on the spot. Seat caps from the tenant plan block invites when the workspace is full
- **Plans & billing**: code catalog (`free` / `starter` / `pro` / `usage`) on `tenants.plan_id` — seat limits and per-member AI allowances. Platform admin assigns the plan; tenants see a read-only Billing page. Ready to wire Stripe (or any PSP) later by setting `planId`
- **Platform admin** (`/admin`): people, platform signup invites, tenants (with members + plan edit modal), and the plans catalog. Bootstrap with `PLATFORM_ADMIN_EMAILS`
- **Public site**: landing with CTAs + auth screens, separate from the logged-in area
- **Example resources**: `tasks` (to-do list) and `articles` (Markdown + cover via MediaStore) — per-tenant, end to end
- **Agent + MCP**: a floating button in the app opens a chat with an assistant (OpenAI) that runs the MCP tools in the tenant context. The same tools are also exposed as a **remote MCP server** (`POST /api/mcp`) authenticated by a personal API key — plug Cursor (or any MCP client) into the published app
- **API keys**: users mint tenant-scoped keys under _Integrations_ and plug the remote MCP server into Cursor (or any MCP client)
- **`SELF_SIGNUP_ENABLED` flag**: turn off to operate invite-only

## Structure

The API is organized by **domain**. Resource domains (copy `task`) typically group schema, repository, DTO, routes and agent tools; platform domains vary (e.g. `account` is routes-only, `billing` has no tools, `usage` is a spend ledger without HTTP routes).

```
apps/api/src/
├── app.ts                # builds the Hono app (middlewares + routes + SPA + health/config) — "the API"
├── server.ts             # HTTP entrypoint: starts the server
├── context.ts            # typed request context (user/tenant/membership from middlewares)
├── agent/                # agent surface (not a domain): assistant (policy), registry,
│                         # mcp-server (adapter), tool (contract), tools/,
│                         # routes/ (in-app chat + remote MCP over HTTP, API-key auth)
├── lib/                  # pure utilities (no app dependency): env, crypto, logger, errors,
│                         # email layout, media-store, image-compress
├── integrations/         # external service wrappers: openai (client + tool loop), resend, r2
├── domains/
│   ├── auth/             # schema, repository, service, dto, emails, middleware, routes/
│   ├── account/          # routes/ (profile, password, API keys)
│   ├── admin/            # platform admin: users, platform invites, tenants, plans
│   ├── billing/          # plan catalog + tenant billing snapshot + seat/AI asserts
│   ├── tenant/           # tenants + members + invites: schema, repository, service,
│   │                     # emails, middleware, routes/, tools/
│   ├── usage/            # AI spend ledger (per user × tenant × month); no HTTP routes
│   ├── task/             # example resource (to-do list): schema, repository, dto, routes/, tools/
│   └── article/          # articles (Markdown + cover): schema, repository, dto, routes/, tools/, media.ts
└── db/                   # client, schema.ts (barrel for drizzle-kit), columns (audit), seed

apps/web                  # React SPA (public pages + logged-in area) — single UI source
apps/desktop              # Tauri desktop shell (packages apps/web; remote API)
apps/mobile               # Tauri iOS shell (same; local Xcode, no App Store CI in v1)
packages/shared           # Zod schemas and DTOs per domain (auth, account, tenant, billing, task, …)
packages/ui               # app-neutral base UI (shadcn), imported per subpath
```

Conventions:

- **One route per file** in `domains/<domain>/routes/`, named `<action>.route.ts` (e.g. `create-task.route.ts`); `routes/index.ts` is the method + path + middlewares map (same role as `tools/index.ts`).
- **One tool per file** in `domains/<domain>/tools/`, named `<action>.tool.ts` (e.g. `create-task.tool.ts`); the tool is self-describing (`summarize` marks a write and becomes a chip in the chat UI). Register the domain's array in `agent/registry.ts`. Agent-owned OpenAI tools live in `agent/tools/`.
- **Tools are transport-neutral**: they return JSON-serializable data and throw `Error` for expected failures. `agent/mcp-server.ts` translates to MCP; `agent/assistant.ts` translates to the OpenAI loop. Domains never import the MCP/OpenAI SDK packages (lint blocks it); agent-owned tools may use `@/integrations/openai`.
- **Name suffix = file role.** Single-role domain files keep the role name (`repository.ts`, `service.ts`, `schema.ts`); folders own their index (`routes/index.ts`, `tools/index.ts`); action files carry the `.route.ts` / `.tool.ts` suffix.
- **The repository owns the SQL** — routes and services don't write queries. Every tenant-scoped resource query filters by `tenantId`.
- **Service only when there's real business logic** (sessions, tokens, invites, seat/AI gates…). Plain CRUD calls the repository straight from the route/tool — that's why `task` has no `service.ts` while `auth`/`tenant`/`billing` do. Once an operation gains a rule, create the service and route the HTTP handler and tool through it.
- **Tenant isolation is safe by default** — each tenant-scoped domain's `routes/index.ts` applies `requireAuth`/`requireTenant` once (via `.use`), so every new route is isolated from the start.
- **New table?** Export the domain schema in `db/schema.ts` (the barrel drizzle-kit reads) and run `db:generate`.
- **Env is validated at boot** (`lib/env.ts`, Zod): a missing required variable kills the process with a clear message instead of breaking on a query. Add new vars to that schema, `.env.example`, and `render.yaml` when production needs them.
- **Imports use the `@/` alias** (→ `apps/api/src/`): anything crossing a boundary uses the alias — `@/lib/*`, `@/integrations/*`, `@/db/*`, `@/domains/<other>/*`. Only imports within the same domain stay relative (`./repository`, `../service`). This way moving files doesn't break imports and `../../../` disappears.
- **Boundaries are enforced by lint** (`.oxlintrc.json`, `no-restricted-imports`): `lib/` can't depend on anything in the app; `integrations/` only on `lib/`; domains only know the agent contract (`@/agent/tool`) and never the MCP/OpenAI SDK packages directly. Cross the line and `npm run lint` flags it.
- **The agent is its own surface** (`agent/`), not a domain: it _consumes_ the domains via `registry.ts` (which joins each domain's `tools/` plus `agent/tools/`). It has two layers: the _policy_ (`agent/assistant.ts` — who the agent is and how it acts) and the _mechanics_ (`integrations/openai.ts` — OpenAI client + the tool-calling loop). The same registry is exposed two ways from one place: the in-app chat (OpenAI loop) and HTTP MCP (`agent/routes/mcp.route.ts`, remote clients authenticated by an API key).

Useful entry points:

- `apps/api/src/app.ts` — all routes mounted in one place
- `apps/api/src/domains/task/` + `apps/web/src/domains/task/pages/TasksPage.tsx` — a complete domain to copy
- `apps/api/src/domains/billing/` — plan catalog, seat assert, AI assert, tenant billing snapshot
- `apps/api/src/domains/tenant/middleware.ts` — tenant isolation
- `apps/api/src/agent/registry.ts` — tools available to the agent and MCP
- `apps/web/src/app/App.tsx` — SPA route map

## Deriving a new product

### Day 1 — name and logo

Product identity is centralized:

1. Edit `packages/shared/src/brand.ts` (`displayName`, `tagline`, `description`, `mcpServerName`, `defaultMailFrom`)
2. Swap the mark in `apps/web/src/brand/logo.tsx` and `apps/web/public/brand/logo.svg` (favicon / OG)
3. Run `npm run sync:brand` (Tauri `productName` / window title / tray labels)
4. Set `MAIL_FROM` in `.env` for real mail (defaults to `brand.defaultMailFrom`)

UI copy that uses `{{brand}}` / `{{tagline}}`, SEO shell meta, invite emails, the agent prompt, and the MCP server name all follow `brand.ts`. Workspace packages (`@app/*`) can stay.

### Next

1. Replace the `tasks` resource with your domain: copy `apps/api/src/domains/task/` (schema → repository → routes → tools), export the schema in `db/schema.ts`, run `db:generate`, add the schemas to `packages/shared` and the page in web
2. Adjust the plan catalog in `apps/api/src/domains/billing/plans.ts` and shared `packages/shared/src/billing.ts` if your pricing differs
3. Rewrite landing marketing copy (`apps/web/src/i18n/locales/landing.*.json`) for your product story
4. Desktop/mobile: update bundle `identifier` if needed, and regenerate icons from one source (`tauri icon`)
5. Set `RESEND_API_KEY` and configure Cloudflare R2 (`CLOUDFLARE_*` / `R2_PUBLIC_BASE_URL`) if you need durable image storage on Render (otherwise media stays on the ephemeral local disk)
6. Deploy: push the repo to GitHub and create a Blueprint on Render pointing to `render.yaml`

## Environment variables

Copy `.env.example` to `.env` at the root (in production Render injects everything):

| Var                            | Description                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `PORT`                         | API listen port (default `5000`; Render injects `PORT`)                        |
| `DATABASE_URL`                 | Postgres (default points to the local Docker)                                  |
| `APP_URL`                      | Public URL used in email links (falls back to `RENDER_EXTERNAL_URL` on Render) |
| `RESEND_API_KEY`               | Optional — without it, emails are logged to the console                        |
| `MAIL_FROM`                    | Sender, e.g. `My App <no-reply@myapp.com>`                                     |
| `OPENAI_API_KEY`               | Optional — without it the agent is disabled                                    |
| `ASSISTANT_MODEL`              | Agent chat model (default `gpt-4o-mini`)                                       |
| `TRANSCRIBE_MODEL`             | Voice transcription model (default `gpt-4o-mini-transcribe`)                   |
| `IMAGE_MODEL`                  | Image generation model (default `gpt-image-1-mini`)                            |
| `SELF_SIGNUP_ENABLED`          | `false` to turn off public sign-up                                             |
| `PLATFORM_ADMIN_EMAILS`        | Comma-separated emails always treated as platform admins once verified         |
| `CLOUDFLARE_S3_API`            | Optional R2 S3 API endpoint — without R2, images write to local disk           |
| `CLOUDFLARE_ACCESS_KEY_ID`     | Optional R2 access key                                                         |
| `CLOUDFLARE_SECRET_ACCESS_KEY` | Optional R2 secret                                                             |
| `CLOUDFLARE_MEDIA_BUCKET`      | R2 bucket name (default `app`)                                                 |
| `R2_PUBLIC_BASE_URL`           | Public base URL for R2 objects                                                 |
| `MEDIA_DIR`                    | Optional local filesystem root for media when R2 is unset                      |
| `CORS_ORIGIN`                  | Optional comma-separated origins for credentialed CORS (Tauri / shell Vite)    |

AI spend limits come from the tenant's plan in the billing catalog — there is no separate `AI_MONTHLY_BUDGET_USD` env var.

Web / shell Vite vars (see `apps/web/.env.example`, `apps/desktop/.env.*`, `apps/mobile/.env.*`):

| Var            | Description                                                                           |
| -------------- | ------------------------------------------------------------------------------------- |
| `VITE_API_URL` | Optional API origin for Tauri shells; omit in the browser deploy (same-origin `/api`) |
| `VITE_ROUTER`  | Set to `hash` for Tauri; omit / other → `BrowserRouter`                               |

## Connect an MCP client (remote)

The API exposes a remote MCP server at `POST /api/mcp`, authenticated by a personal API key. Create a key in **Integrations** (it's scoped to one tenant and shown only once), then add it to your MCP client. Copy `.cursor/mcp.json.example` to `.cursor/mcp.json` (gitignored — never commit keys), set the published app URL, and fill in your key:

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

The server key (`app-base` above) is `brand.mcpServerName` in `packages/shared/src/brand.ts`.

The client gets the same tools as the in-app agent, acting on that key's tenant. Revoke a key from the same screen to cut access.

## Desktop & mobile (Tauri shells)

`apps/desktop` and `apps/mobile` package the same `apps/web` UI and call a **remote** API (`VITE_API_URL` + cookie sessions). Enable `CORS_ORIGIN` on the API (see `.env.example`) so cross-origin cookies work (`SameSite=None` for allow-listed Origins).

```bash
# Desktop (Vite :1420) — API must already be running (`npm run dev`)
npm run dev:desktop

# iOS (Vite :1422) — see apps/mobile/README.md for Xcode / device notes
npm run ios:init -w @app/mobile   # once
npm run dev:mobile
```

### Desktop releases → R2

Installers and updater artifacts use the **same** R2 bucket and credentials as media (`CLOUDFLARE_*` / `R2_PUBLIC_BASE_URL`), under the `desktop-releases/` prefix. Canonical path: bump `apps/desktop` version → push tag `vX.Y.Z` → GitHub Actions
(`.github/workflows/release-desktop-{macos,windows,linux}.yml`) build, sign, and publish.
Details and secret list: [`.cursor/skills/desktop-release/SKILL.md`](.cursor/skills/desktop-release/SKILL.md).

Repo secrets: `VITE_API_URL`, `TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`, plus the same `CLOUDFLARE_S3_API`, `CLOUDFLARE_ACCESS_KEY_ID`, `CLOUDFLARE_SECRET_ACCESS_KEY`, `CLOUDFLARE_MEDIA_BUCKET`, `R2_PUBLIC_BASE_URL` as Render media.

Commit the updater **public** key in `apps/desktop/src-tauri/tauri.conf.json` (replace the placeholder) and point `plugins.updater.endpoints` at `${R2_PUBLIC_BASE_URL}/desktop-releases/latest/latest.json`.

## Scripts

| Command                                 | Does                                  |
| --------------------------------------- | ------------------------------------- |
| `npm run setup`                         | Postgres up + migrate + seed          |
| `npm run dev`                           | API + web in watch                    |
| `npm run dev:desktop`                   | Tauri desktop shell (Vite :1420)      |
| `npm run dev:mobile`                    | Tauri iOS shell (Vite :1422)          |
| `npm run build`                         | Production build (web)                |
| `npm start`                             | API in production (serves SPA)        |
| `npm run db:up` / `db:down`             | Start / stop local Postgres (Docker)  |
| `npm run db:generate`                   | Generate migration from schema        |
| `npm run db:migrate`                    | Apply migrations                      |
| `npm run db:seed`                       | Demo user + tenant + sample tasks     |
| `npm run lint` / `format` / `typecheck` | Quality                               |
| `npm run release:mac:publish`           | Build universal macOS + publish to R2 |
| `npm run release:win:publish`           | Build Windows NSIS + publish to R2    |
| `npm run release:linux:publish`         | Build AppImage + publish to R2        |
