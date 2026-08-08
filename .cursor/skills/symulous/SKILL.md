---
name: symulous
description: >-
  Manage this product's Symulous workspace: tickets on Audits / Features / Bugs
  and settled product docs (Overview, Architecture, Decisions). Use when
  creating/updating tasks, recording decisions, updating architecture docs,
  bootstrapping a forked product's workspace, or repairing `.symulous.json`.
---

# Symulous (tasks + product docs)

One Symulous **workspace per product**. Inside: exactly three **Projects** (ticket buckets) + settled **docs**. The repo binds via `.symulous.json`.

**Tickets** track work and status. **Docs** are final/settled knowledge — not a progress log.

## Binding

```json
{
  "organization_slug": "fecruzb",
  "workspace_slug": "<product-slug>",
  "projects": {
    "audits": { "short_id": "<id>", "name": "Audits" },
    "features": { "short_id": "<id>", "name": "Features" },
    "bugs": { "short_id": "<id>", "name": "Bugs" }
  },
  "phases": ["Discovery", "Design", "Development", "QA", "Launch"],
  "docs": {
    "overview": "<id>",
    "architecture": "<id>",
    "decisions": "<id>"
  }
}
```

Always load this file before MCP calls. Never hardcode IDs from another product.

## Ticket buckets

| Key        | Project  | Put tickets here when…                                                                                        |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `features` | Features | New work, enhancements, domains, product delivery                                                             |
| `bugs`     | Bugs     | Something is broken or regressing                                                                             |
| `audits`   | Audits   | Review/audit/checklist work (conventions, security, structure) — **required** for every audit run (see below) |

### Audits board (required for every audit)

When running a convention/structure/security audit (`.cursor/skills/audit/SKILL.md`):

1. `create_task` on `projects.audits.short_id` at the start (title includes scope + date).
2. Document the full findings in the task body (not only in chat).
3. Remediations: note fixed vs deferred on the same ticket.
4. `complete_task` when the audit (and any agreed fixes) are finished.

Do not skip the ticket even for a clean Pass.

## Day-to-day

### Tasks (status lives here)

1. Pick the bucket (`features` / `bugs` / `audits`) from the table above.
2. `list_tasks` / `search` on that project when checking status.
3. Create agreed work with `create_task`:
   - `project_handle` = `projects.<bucket>.short_id`
   - `phase_name` from `phases` (usually `Discovery` for new items, `Development` when already in flight)
   - optional `priority`, `markdown` body with acceptance notes
4. While working: `start_working` / `move_task` / `comment_on_task` / `append_to_task`.
5. When done: `complete_task` (and advance phase toward `Launch` when useful).

Do **not** create a task for every tiny edit — only agreed, actionable work. Do **not** maintain a Progress/changelog doc.

### Docs (settled only)

| Doc          | Update when                                              |
| ------------ | -------------------------------------------------------- |
| Overview     | Product purpose or audience changes                      |
| Architecture | Structure actually changed (domains added/removed, etc.) |
| Decisions    | A real design/product choice is settled                  |

Prefer `append_to_doc` for new ADR sections. Use `propose_doc_change` / block edits for in-place fixes. Prefer `read_doc` before editing.

### Decision entry format

```markdown
## YYYY-MM-DD — Title

**Context:** …

**Decision:** …

**Consequences:** …
```

Newest first under the doc title.

## Bootstrap (new product from this template)

Use when forking app-base into a new product (or repairing a broken binding).

Checklist:

```
- [ ] 1. Workspace exists in org (UI or already created)
- [ ] 2. create_project ×3: Audits, Features, Bugs (+ icons)
- [ ] 3. Confirm phases (Symulous defaults: Discovery → Launch) or create them
- [ ] 4. create_doc ×3 with seed markdown (below)
- [ ] 5. Write `.symulous.json` with returned short_ids
- [ ] 6. Keep/adjust `.cursor/rules/symulous.mdc` (alwaysApply)
```

### Project icons (from `list_entity_icons`)

- Audits → `shield-check`
- Features → `sparkles`
- Bugs → `bug`

### Seed docs (settled template)

1. **Overview** — what the product is, audience, links to workspace + the three boards.
2. **Architecture** — monorepo map, golden path, living domain table.
3. **Decisions** — ADR list; note Symulous-as-SoR + the three buckets on first bootstrap.

Do not create a Progress doc.

Optional: `set_workspace_icon` with a slug from `list_entity_icons`.

### Repair

If `.symulous.json` is missing or IDs 404:

1. `list_workspaces` → confirm `workspace_slug`
2. `list_projects` / `list_docs` → recover short_ids for Audits, Features, Bugs + docs
3. Rewrite `.symulous.json` — do not recreate docs/projects unless they are actually missing
