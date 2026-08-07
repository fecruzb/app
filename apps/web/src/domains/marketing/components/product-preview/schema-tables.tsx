import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { TableIcon } from "lucide-react";
import { Window } from "@app/ui/browser-window";

export type Column = { name: string; type: string; badge?: "PK" | "FK" | "UQ" };

export function TableCard({
  name,
  columns,
  accent,
}: {
  name: string;
  columns: Column[];
  accent?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div
        className={`flex items-center gap-1.5 border-b px-3 py-1.5 font-mono text-[11px] font-semibold ${
          accent ? "bg-primary/10 text-primary" : "bg-muted/50"
        }`}
      >
        <TableIcon className="size-3" />
        {name}
      </div>
      <div className="divide-y">
        {columns.map((col) => (
          <div key={col.name} className="flex items-center gap-2 px-3 py-1 font-mono text-[10px]">
            <span className={col.badge === "PK" ? "font-medium" : "text-muted-foreground"}>
              {col.name}
            </span>
            <span className="ml-auto text-muted-foreground/60">{col.type}</span>
            {col.badge && (
              <span
                className={`rounded px-1 text-[9px] font-semibold ${
                  col.badge === "FK"
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {col.badge}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Frame wrapper for a single domain's tables, labelled with its schema file. */
function SchemaWindow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Window label={label}>
      <div className="grid gap-2 bg-muted/30 p-4 sm:grid-cols-2">{children}</div>
    </Window>
  );
}

/** Auth domain: identity, sessions, single-use tokens and personal API keys. */
export function AuthTables() {
  return (
    <SchemaWindow label="domains/auth/schema/">
      <TableCard
        name="users"
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "name", type: "text" },
          { name: "email", type: "text", badge: "UQ" },
          { name: "password_hash", type: "text" },
          { name: "email_verified_at", type: "timestamptz" },
        ]}
      />
      <TableCard
        name="sessions"
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "user_id", type: "uuid", badge: "FK" },
          { name: "token_hash", type: "text", badge: "UQ" },
          { name: "expires_at", type: "timestamptz" },
        ]}
      />
      <TableCard
        name="action_tokens"
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "user_id", type: "uuid", badge: "FK" },
          { name: "purpose", type: "enum" },
          { name: "token_hash", type: "text", badge: "UQ" },
        ]}
      />
      <TableCard
        name="api_keys"
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "user_id", type: "uuid", badge: "FK" },
          { name: "tenant_id", type: "uuid", badge: "FK" },
          { name: "prefix", type: "text" },
        ]}
      />
    </SchemaWindow>
  );
}

/** Tenant domain: the workspaces, their membership join table and invites. */
export function TenantTables() {
  return (
    <SchemaWindow label="domains/tenant/schema/">
      <TableCard
        name="tenants"
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "name", type: "text" },
          { name: "slug", type: "text", badge: "UQ" },
          { name: "plan_id", type: "text" },
        ]}
      />
      <TableCard
        name="tenant_members"
        columns={[
          { name: "tenant_id", type: "uuid", badge: "FK" },
          { name: "user_id", type: "uuid", badge: "FK" },
          { name: "role", type: "enum" },
        ]}
      />
      <TableCard
        name="tenant_invites"
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "tenant_id", type: "uuid", badge: "FK" },
          { name: "email", type: "text" },
          { name: "role", type: "enum" },
        ]}
      />
    </SchemaWindow>
  );
}

/**
 * Plan catalog lives in code — tenants only store plan_id.
 * Shown with the same table-card chrome so it reads next to real schemas.
 */
export function PlansCatalog() {
  const { t } = useTranslation();
  return (
    <SchemaWindow label="domains/billing/plans.ts">
      <TableCard
        name="free"
        columns={[
          { name: "maxSeats", type: "1" },
          { name: "price / seat", type: "$0" },
          {
            name: t("landing.preview.plansCatalog.aiPerSeat"),
            type: t("landing.preview.plansCatalog.included"),
          },
        ]}
      />
      <TableCard
        name="starter"
        columns={[
          { name: "maxSeats", type: "3" },
          { name: "price / seat", type: "$5" },
          {
            name: t("landing.preview.plansCatalog.aiPerSeat"),
            type: t("landing.preview.plansCatalog.included"),
          },
        ]}
      />
      <TableCard
        name="pro"
        columns={[
          { name: "maxSeats", type: "10" },
          { name: "price / seat", type: "$5" },
          {
            name: t("landing.preview.plansCatalog.aiPerSeat"),
            type: t("landing.preview.plansCatalog.included"),
          },
        ]}
      />
      <TableCard
        name="usage"
        columns={[
          { name: "maxSeats", type: "∞" },
          { name: "price / seat", type: "$10" },
          {
            name: t("landing.preview.plansCatalog.aiPerSeat"),
            type: t("landing.preview.plansCatalog.passthrough"),
          },
        ]}
      />
    </SchemaWindow>
  );
}

/** AI spend ledger — append-only events per assistant request. */
export function UsageTables() {
  return (
    <SchemaWindow label="domains/usage/schema/ai-usage-events.schema.ts">
      <TableCard
        name="ai_usage_events"
        accent
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "user_id", type: "uuid", badge: "FK" },
          { name: "tenant_id", type: "uuid", badge: "FK" },
          { name: "model", type: "text" },
          { name: "input_tokens", type: "int" },
          { name: "output_tokens", type: "int" },
          { name: "cost_micros", type: "int" },
          { name: "created_at", type: "timestamptz" },
        ]}
      />
    </SchemaWindow>
  );
}

/** Article + cover metadata — cover bytes live in object storage. */
export function ArticleTables() {
  return (
    <SchemaWindow label="domains/article/schema/articles.schema.ts">
      <TableCard
        name="articles"
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "tenant_id", type: "uuid", badge: "FK" },
          { name: "author_id", type: "uuid", badge: "FK" },
          { name: "title", type: "text" },
          { name: "body", type: "text" },
          { name: "cover_path", type: "text" },
          { name: "cover_content_type", type: "text" },
          { name: "cover_size_bytes", type: "int" },
        ]}
      />
    </SchemaWindow>
  );
}

/** Platform signup invites — orthogonal to tenant invites. */
export function PlatformTables() {
  return (
    <SchemaWindow label="domains/admin/schema/platform-invites.schema.ts">
      <TableCard
        name="platform_invites"
        columns={[
          { name: "id", type: "uuid", badge: "PK" },
          { name: "email", type: "text" },
          { name: "token_hash", type: "text", badge: "UQ" },
          { name: "invited_by", type: "uuid", badge: "FK" },
          { name: "expires_at", type: "timestamptz" },
        ]}
      />
    </SchemaWindow>
  );
}

/** The example resource — the exact shape you copy for your own domains. */
export function TaskTable() {
  return (
    <Window label="domains/task/schema/tasks.schema.ts">
      <div className="bg-muted/30 p-4">
        <TableCard
          name="tasks"
          accent
          columns={[
            { name: "id", type: "uuid", badge: "PK" },
            { name: "tenant_id", type: "uuid", badge: "FK" },
            { name: "author_id", type: "uuid", badge: "FK" },
            { name: "title", type: "text" },
            { name: "completed", type: "bool" },
            { name: "created_at", type: "timestamptz" },
          ]}
        />
      </div>
    </Window>
  );
}
