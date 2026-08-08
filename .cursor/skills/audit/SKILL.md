---
name: audit
description: >-
  Audits app-base code and structure against project conventions, Cursor rules,
  layer boundaries, security invariants, and the task-domain golden path. Use
  when the user asks to audit, review conventions, check structure/padrões,
  verify a domain or PR against rules, or run a convention/compliance check.
---

# Convention audit (app-base)

Read-only by default: **report findings, do not fix** unless the user asks to
fix them. Source of truth is `.cursor/rules/*.mdc` plus the `task` domain as
the canonical example — do not invent standards.

## Scope

Resolve what to audit (ask only if ambiguous):

| User says                                   | Scope                                                         |
| ------------------------------------------- | ------------------------------------------------------------- |
| a path / domain / file                      | that target only                                              |
| "this PR" / "my changes" / nothing specific | `git diff` vs base (`main` if available) + unstaged/untracked |
| "full" / "whole repo" / a package           | that package or the whole monorepo                            |

Always name the scope in the report header.

## Workflow

Copy and track:

```
- [ ] 1. Resolve scope + list files
- [ ] 2. Create Symulous Audits ticket (document as you go)
- [ ] 3. Load relevant Cursor rules (and this checklist)
- [ ] 4. Structural / naming / registration pass
- [ ] 5. Security + tenant isolation pass
- [ ] 6. Contracts, layers, i18n, UI package pass
- [ ] 7. Run npm run lint && npm run typecheck
- [ ] 8. Write the report into the ticket + chat
- [ ] 9. stop_working then complete_task when audit (+ agreed fixes) are done
```

### Symulous (required)

Findings live on the **Audits** project — never only in chat. Read `.symulous.json`, then:

1. `create_task` on `projects.audits.short_id` with title like `Convention audit — <scope> (YYYY-MM-DD)`, `phase_name` usually `QA`, body seeded with scope. Use a **stable scope name** (`full monorepo`, `apps/api`, `apps/web`, `git diff vs main`) — not transient labels like `uncommitted changes` unless that is the intentional, documented scope.
2. Put the full report in the task (`markdown` / `append_to_task`): Summary, Findings by severity (paths), checks run, out of scope.
3. If remediating: `start_working`, fix, note fixed vs deferred on the ticket.
4. Always finish with phase **`Launch`** (`update_task` `phase_name: "Launch"`), then **`stop_working` then `complete_task`** (even for report-only). `complete_task` alone leaves the Working chip; leaving phase on `QA` is incorrect for closed audits.
5. While the audit is in flight, keep phase at `QA` (create with `QA`; remediations stay `QA` until closed).
6. In chat, link the task absolute `url`.

See `.cursor/rules/symulous.mdc` (Audits section) and `.cursor/skills/symulous/SKILL.md`.

### 1. Resolve scope

Collect the file set. Prefer concrete paths over vague "look around".

### 2. Load rules (progressive)

Read only what the scope needs:

| Scope touches           | Read                                                                |
| ----------------------- | ------------------------------------------------------------------- |
| anything                | `project-overview.mdc`, `security.mdc`, `language.mdc`              |
| `apps/api/**`           | `api-structure.mdc` (+ `agent-tools.mdc` if `*.tool.ts` / `agent/`) |
| `apps/web/**`           | `web-structure.mdc`                                                 |
| `packages/shared/**`    | `shared-contracts.mdc`                                              |
| `packages/ui/**`        | `ui-package.mdc`                                                    |
| new / incomplete domain | `.cursor/skills/add-feature/SKILL.md` registration checklist        |

For deep itemized checks, open [checklist.md](checklist.md). Compare resource
domains to `apps/api/src/domains/task/` and `apps/web/src/domains/task/`.

### 3–5. Audit passes

Walk the scoped files against the checklist. Cite **file paths** (and line
ranges when useful). Deduplicate: one finding per issue, not per rule restatement.

**Critical (must fix):** tenant leaks, secrets/raw tokens in DTOs/logs, missing
`requireAuth`/`requireTenant` on tenant mounts, duplicated contracts outside
`@app/shared`, layer-boundary violations, hand-written migrations, hardcoded UI
copy, SQL outside `repository.ts`.

**Warning:** wrong file names/folders, missing registration (`app.ts`,
`db/schema.ts`, `agent/registry.ts`, `routes.tsx`, nav, `shared` barrel, UI
`exports`), route/tool missing Input/Processing/Output banners, pages calling
`fetch`/`@/lib/api` directly, `service.ts` with no real logic, empty domain
folders, i18n key missing in one locale file.

**Note:** style/JSDoc gaps, naming nits, optional cleanups that still compile.

Skip noise: do not fail on intentional exceptions already documented in the
rules (e.g. `marketing` web-only, `usage` API-only, admin under `/api/admin`,
public invite/join/mcp route groups).

### 6. Machine checks

From repo root:

```bash
npm run lint
npm run typecheck
```

Record pass/fail. If scope is tiny and unrelated to TS/lint, you may note that
and still run them when feasible — they are the project gate.

Never read or print `.env` / secret values during the audit.

### 7. Report format

```markdown
# Convention audit

**Scope:** <paths or "git diff vs main">
**Verdict:** Pass | Pass with warnings | Fail

## Summary

<2–4 sentences: what was checked and the headline>

## Findings

### Critical

- `path` — issue — rule/invariant (fix: …)

### Warning

- …

### Note

- …

## Checks run

- lint: pass/fail
- typecheck: pass/fail

## Out of scope / not checked

- …
```

Omit empty severity sections. If clean: say so and keep Summary short.

Mirror this report into the Symulous Audits ticket body. In chat, include the ticket `url` and whether you can apply fixes (only if the user wants).

## Triggers (examples)

- "audita o domínio article"
- "audit conventions on my changes"
- "check if this PR follows the cursor rules"
- "verifica se a estrutura está no padrão"
