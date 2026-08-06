---
name: add-feature
description: >-
  Adds a new resource/domain to app-base end to end: Drizzle table → repository
  → routes → agent tools → shared contracts → web api/page/routes/nav. Use
  whenever adding a feature, resource, entity, CRUD, domain, table, route or
  page to this project, or when replacing the example task domain.
---

# Add a feature (new domain, end to end)

A feature is a domain folder on both sides. Copy the `task` domain — it is the canonical example for every step. Work in this order; each step names the exact file and where it gets registered. Do not skip registration steps: an unregistered file compiles but never runs.

Checklist (track progress):

```
- [ ] 1. API: schema.ts (table)
- [ ] 2. Register in db/schema.ts barrel + generate migration
- [ ] 3. API: repository.ts (all SQL)
- [ ] 4. Shared: input schema + DTO in packages/shared
- [ ] 5. API: dto.ts (row → DTO)
- [ ] 6. API: routes/ (handlers + index.ts route map)
- [ ] 7. Mount routes in app.ts
- [ ] 8. API: tools/ + register in agent/registry.ts
- [ ] 9. Web: api.ts
- [ ] 10. Web: pages/ + routes.tsx + compose + nav link
- [ ] 11. Verify: lint, typecheck, click through
```

## API side

**1. Table** — `apps/api/src/domains/<domain>/schema.ts`. Copy `domains/task/schema.ts`: `uuid("id").primaryKey().defaultRandom()`, a `tenant_id` FK with `onDelete: "cascade"`, `...timestamps` from `@/db/columns`, an index on `tenantId`, and `export type Xxx = typeof xxx.$inferSelect`.

**2. Register + migrate** — add `export * from "@/domains/<domain>/schema"` to `apps/api/src/db/schema.ts` (the barrel drizzle-kit reads), then run `npm run db:generate` and `npm run db:migrate`. Never write SQL migrations by hand.

**3. Repository** — `repository.ts`, an exported object of async methods that owns ALL the SQL. For a new tenant-scoped resource, copy `task`: CRUD names `list` / `find` / `insert` / `update` / `delete`, every method takes `tenantId` and filters by it, each query written inline in the method (no shared helpers), annotated returns. Return rows (or join shapes), never DTOs — mapping stays in `dto.ts`. Routes, services and tools never write queries. (Platform domains like `auth`/`tenant` use entity-prefixed method names instead; see `api-structure.mdc`.)

**4. Shared contract** — `packages/shared/src/<domain>.ts`: a Zod `<thing>InputSchema` with real constraints and a `type XxxDto` (dates as ISO strings). Add `export * from "./<domain>"` to `packages/shared/src/index.ts`.

**5. DTO mapper** — `dto.ts` with `toXxxDto(row): XxxDto` (`.toISOString()` for dates). Never map inline inside a route.

**6. Routes** — one file per action in `routes/<action>.route.ts`, handler `export async function <action>(c: AppContext)` (name = route action, no suffix, no default export). Body: Input → Processing → Output (`parseBody` → repository → `c.json(toXxxDto(...))`). UUID params via `uuidParam(c, "xxxId")`; expected failures via `throw new HttpError(status, message)`. Wire them in `routes/index.ts` (same role as `tools/index.ts`):

```ts
export const xxxRoutes = new Hono<AppEnv>()
  .use("*", requireAuth, requireTenant)
  .get("/", listXxx)
  .post("/", createXxx);
```

Only add a `service.ts` when there is real business logic; plain CRUD calls the repository straight from the route.

**7. Mount** — in `apps/api/src/app.ts`: `app.route("/api/tenants/:tenantId/<plural>", xxxRoutes)` importing from `@/domains/<domain>/routes`.

**8. Agent tools** — one per file in `tools/<action>.tool.ts` using `defineTool` from `@/agent/tool`, snake_case `name`, `summarize` only on writes; reuse the repository in `execute`. Collect them in `tools/index.ts` as `export const xxxTools: AgentTool[] = [...]` and add that array to `allTools` in `apps/api/src/agent/registry.ts`. Never import MCP/OpenAI from a domain (lint blocks it).

## Web side

**9. Domain API** — `apps/web/src/domains/<domain>/api.ts`: a typed object wrapping `@/lib/api`, returning the shared DTOs. Pages never call `fetch` or `@/lib/api` directly.

**10. Page + routes + nav** — `pages/XxxPage.tsx` copied from `domains/task/pages/TasksPage.tsx`: reads via `useQuery({ queryKey: ["<resource>", tenant.id], ... })`, writes via `useMutation` that invalidates on success and calls `showApiError(err, "...")` on error; `PageHeader` / `PageLoading` / `EmptyState` from `@app/ui`; destructive actions through `useConfirm()`. Then:

- `routes.tsx`: `export const xxxRoutes = <Route path="<plural>" element={<XxxPage />} />;`
- Compose it inside `apps/web/src/domains/tenant/routes.tsx` under the `:tenantSlug` layout
- Add a sidebar item to the `items` array in `Shell()` (`apps/web/src/layouts/AppLayout.tsx`), or a user-menu entry for account-style pages (billing, integrations)
- Domain UI goes in `components/` (kebab-case), React context in `context/<name>-provider.tsx`, reusable hooks in `hooks/` — create each folder with the first file; never leave domain UI loose at the domain root, and never add a top-level `src/components/`

## Verify

**11.** `npm run lint` and `npm run typecheck` must pass. Run `npm run dev` and exercise the flow (login: `demo@example.com` / `demo1234`).

## Replacing the example (`task`)

When the product's real resource replaces tasks, remove every registration in reverse: both `domains/task/` folders, the barrel export in `db/schema.ts` (then `db:generate` for the drop migration), `taskTools` in `agent/registry.ts`, the mount in `app.ts`, the composition in `tenant/routes.tsx`, the nav item in `AppLayout.tsx`, and `packages/shared/src/task.ts` (+ its `index.ts` export).
