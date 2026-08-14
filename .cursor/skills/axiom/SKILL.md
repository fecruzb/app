---
name: axiom
description: >-
  Manage this product's Axiom workspace: tickets on Audits / Features / Bugs
  and settled product docs (Overview, Architecture, Decisions). Use when
  creating/updating tasks, recording decisions, updating architecture docs,
  bootstrapping a forked product's workspace, or repairing `.axiom.json`.
---

# Axiom (tasks + product docs)

One Axiom **workspace per product**. Inside: exactly three **Projects** (ticket buckets) + settled **docs**. The repo binds via `.axiom.json`.

**Tickets** track work and status. **Docs** are final/settled knowledge — not a progress log.

MCP server: **`user-axiom`**. This repo's work is written only to this workspace.

**Language for workspace content**: English.

## Binding

```json
{
  "tenant_slug": "<tenant-slug>",
  "workspace_slug": "<product-slug>",
  "projects": {
    "audits": { "slug": "audits", "name": "Audits" },
    "features": { "slug": "features", "name": "Features" },
    "bugs": { "slug": "bugs", "name": "Bugs" }
  },
  "docs": {
    "overview": "<uuid>",
    "architecture": "<uuid>",
    "decisions": "<uuid>"
  }
}
```

Always load this file before MCP calls. Never hardcode IDs from another product. Axiom identifies projects by **slug** and docs/tasks by **UUID** — there are no short_ids or phases.

## Ticket buckets

| Key        | Project  | Put tickets here when…                                                                            |
| ---------- | -------- | ------------------------------------------------------------------------------------------------- |
| `features` | Features | New work, enhancements, domains, product delivery                                                 |
| `bugs`     | Bugs     | Something is broken or regressing                                                                 |
| `audits`   | Audits   | Review/audit/checklist work (conventions, security, structure) — **required** for every audit run |

### Audits board (required for every audit)

1. `create_task` on `projects.audits.slug` at the start (title includes scope + date).
2. Document the full findings in the task body (not only in chat).
3. Remediations: note fixed vs deferred on the same ticket.
4. Finish with `complete_task` / `status: done` only when the work is on `main`.

Do not skip the ticket even for a clean Pass.

### Ticket title hygiene

Titles should name the **work**, not a transient git state:

- Audits: `Convention audit — <stable scope> (YYYY-MM-DD)` — e.g. `full monorepo`, `apps/api`, `apps/web`.
- Features / Bugs: short outcome-oriented titles; no "WIP", agent run ids, or branch names.

## Day-to-day

### Tasks (status lives here)

1. Pick the bucket (`features` / `bugs` / `audits`) from the table above.
2. `list_tasks` on that project when checking status (`workspace_slug` + `project_slug` from the binding).
3. Create agreed work with `create_task`:
   - `project_slug` = `projects.<bucket>.slug`
   - `status`: `todo` when ready to pick up; `backlog` when not ready yet
   - optional `priority`, `markdown` body with acceptance notes
4. Before implementing: `update_task` → `doing`. A new ticket is born `todo` — flip it in the same step.
5. While working: `comment_on_task` / `append_to_task` as needed.
6. When done and on `main`: `complete_task` or `update_task` → `done`. Unpushed work stays `doing`.

Do **not** create a task for every tiny edit — only agreed, actionable work. Do **not** maintain a Progress/changelog doc.

### Docs (settled only)

| Doc          | Update when                                              |
| ------------ | -------------------------------------------------------- |
| Overview     | Product purpose or audience changes                      |
| Architecture | Structure actually changed (domains added/removed, etc.) |
| Decisions    | A real design/product choice is settled                  |

Prefer `append_to_doc` for new ADR sections. Prefer `read_doc` before editing. Use `replace_doc_content` only when rewriting a page.

### Decision entry format

```markdown
## YYYY-MM-DD — Title

**Context:** …

**Decision:** …

**Consequences:** …
```

Newest first under the doc title.

### Linking

- In comments/docs: `[Title](axiom:doc/<workspace_slug>/<docId>)` / `[Title](axiom:task/<workspace_slug>/<project>/<taskId>)`
- In Cursor chat: `https://axiom.fecruzb.com/app/<tenant_slug>/w/<workspace_slug>/p/<project>/t/<taskId>`

## Bootstrap (new product from this template)

Use when a product workspace exists but `.axiom.json` is missing.

```
- [ ] 1. Workspace exists in the tenant (UI or already created)
- [ ] 2. create_project ×3: Audits, Features, Bugs
- [ ] 3. create_doc ×3 with seed markdown (below)
- [ ] 4. Write `.axiom.json` with returned slugs / UUIDs
- [ ] 5. Keep/adjust `.cursor/rules/axiom.mdc` (alwaysApply)
```

### Seed docs (settled template)

1. **Overview** — what the product is, audience, links to the three boards.
2. **Architecture** — monorepo map, golden path, living domain table.
3. **Decisions** — ADR list; note Axiom-as-SoR + the three buckets on first bootstrap.

Do not create a Progress doc.

### Repair

If `.axiom.json` is missing or IDs 404:

1. `list_workspaces` → confirm `workspace_slug`
2. `list_projects` / `list_docs` → recover slugs for Audits, Features, Bugs + doc UUIDs
3. Rewrite `.axiom.json` — do not recreate docs/projects unless they are actually missing
