---
name: symulous
description: >-
  Manage this product's Symulous workspace: delivery tasks on the bound project
  and the minimal product docs. Use when creating/updating tasks, recording
  decisions or progress, updating architecture docs, bootstrapping a forked
  product's workspace, or repairing `.symulous.json`.
---

# Symulous (tasks + product docs)

One Symulous **workspace per product**. Inside: one main **Project** (tasks) + minimal **docs**. The repo binds via `.symulous.json`.

## Binding

```json
{
  "organization_slug": "fecruzb",
  "workspace_slug": "<product-slug>",
  "project": { "short_id": "<id>", "name": "<Product>" },
  "phases": ["Backlog", "Doing", "Done"],
  "docs": {
    "overview": "<id>",
    "architecture": "<id>",
    "decisions": "<id>",
    "progress": "<id>"
  }
}
```

Always load this file before MCP calls. Never hardcode IDs from another product.

## Day-to-day

### Tasks

1. `list_tasks` / `search` on the bound project when checking status.
2. Create agreed work with `create_task`:
   - `project_handle` = `project.short_id`
   - `phase_name` = `Backlog` (planned) or `Doing` (starting now)
   - optional `priority`, `markdown` body with acceptance notes
3. While working: `start_working` / `move_task` / `comment_on_task` / `append_to_task`.
4. When done: `complete_task` (and move to `Done` if phases are used).

Do **not** create a task for every tiny edit — only agreed, actionable work.

### Docs

| Doc          | Update when                                             |
| ------------ | ------------------------------------------------------- |
| Overview     | Product purpose, audience, or high-level status changes |
| Architecture | Domains added/removed, structural shifts                |
| Decisions    | A real design/product choice is made                    |
| Progress     | Something notable ships                                 |

Prefer `append_to_doc` for new sections. Use `propose_doc_change` / block edits for in-place fixes. Prefer `read_doc` before editing.

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
- [ ] 2. create_project (main board) + icon
- [ ] 3. create_phase: Backlog, Doing, Done
- [ ] 4. create_doc ×4 with seed markdown (below)
- [ ] 5. Write `.symulous.json` with returned short_ids
- [ ] 6. Keep/adjust `.cursor/rules/symulous.mdc` (alwaysApply)
```

### Seed docs (minimal template)

1. **Overview** — what the product is, status, audience, links to workspace/board.
2. **Architecture** — monorepo map, golden path, living domain table.
3. **Decisions** — ADR list; include the Symulous-as-SoR decision on first bootstrap.
4. **Progress** — dated changelog; note the bootstrap itself.

Optional: `set_workspace_icon` with a slug from `list_entity_icons`.

### Repair

If `.symulous.json` is missing or IDs 404:

1. `list_workspaces` → confirm `workspace_slug`
2. `list_projects` / `list_docs` → recover short_ids
3. Rewrite `.symulous.json` — do not recreate docs/projects unless they are actually missing
