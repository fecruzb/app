# Audit checklist (detail)

Use with [SKILL.md](SKILL.md). Rules win if anything here drifts.

Canonical examples: `domains/task` (API + web), `packages/shared/src/task.ts`.

## Golden path / domain shape

- [ ] Tenant resource has matching folders: `apps/api/src/domains/<d>/`, `apps/web/src/domains/<d>/`, `packages/shared/src/<d>.ts` (unless documented exception: marketing, usage, agent chat UI, etc.)
- [ ] Domain folder singular; URLs plural (`/tasks`)
- [ ] No feature logic scattered into unrelated shared files
- [ ] Registrations present when files exist:
  - API schema → `db/schema.ts` barrel + generated migration (not hand-written)
  - Routes → `routes/index.ts` + mount in `app.ts`
  - Tools → `tools/index.ts` + `agent/registry.ts`
  - Shared → `packages/shared/src/index.ts`
  - Web pages → domain `routes.tsx` + compose in `tenant/routes.tsx` (or top-level group) + nav/user-menu as appropriate

## API (`api-structure.mdc`)

- [ ] File names: `<action>.route.ts`, `<action>.tool.ts`, `repository.ts`, `dto.ts`, `service.ts` only when needed
- [ ] Handlers: `export async function <action>(c: AppContext)` — no `Route` suffix, no default export
- [ ] Route/tool bodies have `// -- Input -----------------------------------------------------------------` / `// -- Processing ------------------------------------------------------------` / `// -- Output ----------------------------------------------------------------`
- [ ] JSON via `parseBody(c, schema)` from `@app/shared`; UUIDs via `uuidParam`
- [ ] Failures via `HttpError`; no stack/SQL leakage
- [ ] All SQL in `repository.ts`; routes/tools/services do not query
- [ ] Resource repo methods take `tenantId` and filter by it; return rows not DTOs
- [ ] DTO mapping only in `dto.ts` (or service for aggregates) — no `...row` spreads
- [ ] Tenant route groups: `.use("*", requireAuth, requireTenant)`
- [ ] Admin only under `/api/admin` + `requirePlatformAdmin`
- [ ] Imports: `@/` across boundaries; relative only inside the same domain
- [ ] Layers: `lib/` imports nothing from app; `integrations/` only `lib/`; domains never import MCP/OpenAI SDK (agent-owned tools may use `@/integrations/openai`)
- [ ] New env: `lib/env.ts` + `.env.example` (+ `render.yaml` / `sync: false` for secrets)

## Agent tools (`agent-tools.mdc`)

- [ ] `defineTool` from `@/agent/tool`; snake_case `name`
- [ ] `summarize` only on writes
- [ ] Domain tools do not import MCP/OpenAI packages
- [ ] Same Input/Processing/Output banners as routes
- [ ] `tenantId` / user from tool context, never from args

## Web (`web-structure.mdc`)

- [ ] Domain layout: `api.ts`, `pages/XxxPage.tsx`, `routes.tsx`, `components/` / `context/` / `hooks/` as needed (no empty folders; no loose UI at domain root)
- [ ] No top-level `apps/web/src/components/`
- [ ] Pages use domain `api.ts` — not raw `fetch` / `@/lib/api` helpers (may import `ApiError` / `showApiError`)
- [ ] Reads: `useQuery`; writes: `useMutation` + invalidate; errors: `showApiError`
- [ ] `PageHeader` / `PageLoading` / `EmptyState`; destructive via `useConfirm()` not `window.confirm`
- [ ] UI copy via `t("…")`; keys in both locale files of the pair (`en`/`pt` or landing pair)
- [ ] Product mark via `AppLogo` (`@/brand/logo`); display name / MCP id from `@app/shared` `brand` — not hardcoded "App Base" / Lucide stand-ins in shells
- [ ] Colors via theme CSS variables — no hardcoded product palette in components
- [ ] Imports: `@/` across domains/shell; `@app/ui` for base UI

## Shared (`shared-contracts.mdc`)

- [ ] One file per domain API surface; Zod inputs + `XxxDto` with ISO date strings
- [ ] No apps/DB/HTTP imports; Zod-only runtime
- [ ] No duplicated request/response types on API or web

## UI package (`ui-package.mdc`)

- [ ] App-neutral: no `@/` / product copy / domain knowledge
- [ ] New public entry in `package.json` `exports`
- [ ] Correct category folder; multi-file → folder + `index`
- [ ] Colors from CSS variables (documented exceptions only)

## Security (`security.mdc`) — always

- [ ] No secrets committed or hardcoded; no `.env` contents in report
- [ ] DB stores hashes only; raw tokens only at edges; never in DTOs/logs/errors
- [ ] Tenant context from middleware/tool ctx, not body/query/args on tenant mounts
- [ ] Tenant-scoped queries always filter `tenantId`

## Language (`language.mdc`)

- [ ] Code/comments/commits/API messages in English
- [ ] User-facing strings not hardcoded in JSX

## Machine gates

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
