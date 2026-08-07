import type { TFunction } from "i18next";
import type { ExplorerNode } from "@app/ui/explorer";

/** Full monorepo — Structure overview section. */
export function buildRepoTree(t: TFunction): ExplorerNode[] {
  return [
    {
      name: "apps",
      kind: "folder",
      children: [
        {
          name: "api",
          kind: "folder",
          hint: t("landing.structureIntro.preview.api"),
          active: true,
          children: [
            { name: "package.json", kind: "file" },
            { name: "src", kind: "folder", children: [{ name: "index.ts", kind: "file" }] },
          ],
        },
        {
          name: "web",
          kind: "folder",
          hint: t("landing.structureIntro.preview.web"),
          children: [
            { name: "package.json", kind: "file" },
            { name: "src", kind: "folder", children: [{ name: "main.tsx", kind: "file" }] },
          ],
        },
      ],
    },
    {
      name: "packages",
      kind: "folder",
      children: [
        {
          name: "shared",
          kind: "folder",
          hint: t("landing.structureIntro.preview.shared"),
          children: [{ name: "src", kind: "folder" }],
        },
        {
          name: "ui",
          kind: "folder",
          hint: t("landing.structureIntro.preview.ui"),
          children: [{ name: "src", kind: "folder" }],
        },
      ],
    },
    {
      name: ".cursor",
      kind: "folder",
      children: [
        { name: "rules", kind: "folder", hint: t("landing.structureIntro.preview.rulesHint") },
      ],
    },
    { name: "render.yaml", kind: "file", hint: t("landing.structureIntro.preview.renderHint") },
    { name: "turbo.json", kind: "file", hint: t("landing.structureIntro.preview.turboHint") },
    { name: "package.json", kind: "file" },
  ];
}

/** API overview — closed domains, task peeks one level. */
export function buildApiTree(t: TFunction): ExplorerNode[] {
  const p = (key: string) => t(`landing.moduleZoom.api.hints.${key}`);
  return [
    {
      name: "src",
      kind: "folder",
      children: [
        {
          name: "domains",
          kind: "folder",
          hint: p("domains"),
          children: [
            { name: "auth", kind: "folder", hint: p("auth") },
            { name: "tenant", kind: "folder", hint: p("tenant") },
            {
              name: "task",
              kind: "folder",
              hint: p("task"),
              active: true,
              children: [
                { name: "schema", kind: "folder", active: true },
                { name: "repository.ts", kind: "file" },
                { name: "dto.ts", kind: "file" },
                { name: "routes", kind: "folder" },
                { name: "tools", kind: "folder" },
              ],
            },
            { name: "article", kind: "folder", hint: p("article") },
            { name: "account", kind: "folder", hint: p("account") },
            { name: "billing", kind: "folder", hint: p("billing") },
            { name: "usage", kind: "folder", hint: p("usage") },
            { name: "admin", kind: "folder", hint: p("admin") },
          ],
        },
        { name: "lib", kind: "folder", hint: p("lib") },
        { name: "integrations", kind: "folder", hint: p("integrations") },
        { name: "db", kind: "folder", hint: p("db") },
        { name: "agent", kind: "folder", hint: p("agent") },
        { name: "app.ts", kind: "file", hint: p("app") },
        { name: "server.ts", kind: "file" },
      ],
    },
  ];
}

type ApiFolderFocus =
  | "domains"
  | "lib"
  | "integrations"
  | "db"
  | "agent"
  | "app"
  | "schema"
  | "repository"
  | "dto"
  | "routes"
  | "tools"
  | "service"
  | "middleware"
  | "constants"
  | "utils"
  | "template";

/** Collapsed sibling — visible for place-in-tree, quiet so focus stays clear. */
function ctx(name: string, kind: "folder" | "file" = "folder"): ExplorerNode {
  return { name, kind, muted: true };
}

/**
 * src/ shell: focus expanded, every other top-level entry collapsed + muted.
 * Shows where the piece sits without opening the whole tree.
 */
function srcShell(
  focusName: string,
  focus: ExplorerNode,
  h: (k: string) => string,
): ExplorerNode[] {
  const slots: { name: string; kind: "folder" | "file"; hint?: string }[] = [
    { name: "domains", kind: "folder", hint: h("domains") },
    { name: "lib", kind: "folder", hint: h("lib") },
    { name: "integrations", kind: "folder", hint: h("integrations") },
    { name: "db", kind: "folder", hint: h("db") },
    { name: "agent", kind: "folder", hint: h("agent") },
    { name: "app.ts", kind: "file", hint: h("app") },
    { name: "server.ts", kind: "file", hint: h("server") },
  ];

  return [
    {
      name: "src",
      kind: "folder",
      children: slots.map((slot) =>
        slot.name === focusName
          ? focus
          : { name: slot.name, kind: slot.kind, hint: slot.hint, muted: true },
      ),
    },
  ];
}

/**
 * domains/<name>/ — open the focus domain only.
 * Other domains collapse to a single muted "···" so the list stays short.
 */
function domainsShell(domainBody: ExplorerNode, h: (k: string) => string): ExplorerNode {
  return {
    name: "domains",
    kind: "folder",
    hint: h("domains"),
    children: [domainBody, { name: "···", kind: "folder", muted: true, hint: h("moreDomains") }],
  };
}

/** Roles inside a domain — only the focus expands; others stay collapsed + muted. */
function domainRoles(
  focusName: string,
  focus: ExplorerNode,
  h: (k: string) => string,
): ExplorerNode[] {
  const slots: { name: string; kind: "folder" | "file"; hint: string }[] = [
    { name: "schema", kind: "folder", hint: h("schema") },
    { name: "repository.ts", kind: "file", hint: h("repository") },
    { name: "dto.ts", kind: "file", hint: h("dto") },
    { name: "routes", kind: "folder", hint: h("routes") },
    { name: "tools", kind: "folder", hint: h("tools") },
    { name: "service.ts", kind: "file", hint: h("service") },
    { name: "middleware", kind: "folder", hint: h("middleware") },
    { name: "constants", kind: "folder", hint: h("constants") },
    { name: "utils", kind: "folder", hint: h("utils") },
    { name: "template", kind: "folder", hint: h("template") },
  ];

  return slots.map((slot) =>
    slot.name === focusName
      ? focus
      : { name: slot.name, kind: slot.kind, hint: slot.hint, muted: true },
  );
}

function inDomain(
  domainName: string,
  focusName: string,
  focus: ExplorerNode,
  h: (k: string) => string,
): ExplorerNode[] {
  return srcShell(
    "domains",
    domainsShell(
      {
        name: domainName,
        kind: "folder",
        active: true,
        children: domainRoles(focusName, focus, h),
      },
      h,
    ),
    h,
  );
}

/**
 * Compact Explorer focused on one folder — path ancestors open, siblings
 * collapsed + muted so you still see place-in-tree.
 */
export function buildApiFolderTree(
  folder: ApiFolderFocus,
  t: TFunction,
): { workspace: string; tree: ExplorerNode[] } {
  const h = (key: string) => t(`landing.apiCourse.folderHints.${key}`);
  const workspace = t("landing.moduleZoom.api.workspace");

  switch (folder) {
    case "domains":
      return {
        workspace,
        tree: srcShell(
          "domains",
          {
            name: "domains",
            kind: "folder",
            hint: h("domains"),
            active: true,
            children: [
              { name: "task", kind: "folder", hint: h("resource"), active: true },
              { name: "auth", kind: "folder", hint: h("platform") },
              { name: "account", kind: "folder", hint: h("routesOnly") },
              { name: "billing", kind: "folder", hint: h("catalog") },
              { name: "usage", kind: "folder", hint: h("ledger") },
              ctx("admin"),
            ],
          },
          h,
        ),
      };
    case "lib":
      return {
        workspace,
        tree: srcShell(
          "lib",
          {
            name: "lib",
            kind: "folder",
            hint: h("lib"),
            active: true,
            children: [
              { name: "env.ts", kind: "file", active: true },
              { name: "crypto.ts", kind: "file" },
              { name: "errors.ts", kind: "file" },
              { name: "media-store.ts", kind: "file" },
            ],
          },
          h,
        ),
      };
    case "integrations":
      return {
        workspace,
        tree: srcShell(
          "integrations",
          {
            name: "integrations",
            kind: "folder",
            hint: h("integrations"),
            active: true,
            children: [
              { name: "resend.ts", kind: "file", hint: h("email"), active: true },
              { name: "openai.ts", kind: "file", hint: h("ai") },
              { name: "r2.ts", kind: "file", hint: h("files") },
            ],
          },
          h,
        ),
      };
    case "db":
      return {
        workspace,
        tree: srcShell(
          "db",
          {
            name: "db",
            kind: "folder",
            hint: h("db"),
            active: true,
            children: [
              { name: "schema.ts", kind: "file", hint: h("barrel"), active: true },
              { name: "client.ts", kind: "file" },
              { name: "columns.ts", kind: "file" },
              { name: "seed.ts", kind: "file" },
            ],
          },
          h,
        ),
      };
    case "agent":
      return {
        workspace,
        tree: srcShell(
          "agent",
          {
            name: "agent",
            kind: "folder",
            hint: h("agent"),
            active: true,
            children: [
              { name: "tool.ts", kind: "file", hint: h("toolDef"), active: true },
              { name: "registry.ts", kind: "file", hint: h("registry") },
              { name: "routes", kind: "folder", hint: h("chat") },
              { name: "mcp-server.ts", kind: "file", hint: h("mcp") },
            ],
          },
          h,
        ),
      };
    case "app":
      return {
        workspace,
        tree: srcShell("app.ts", { name: "app.ts", kind: "file", hint: h("app"), active: true }, h),
      };
    case "schema":
      return {
        workspace,
        tree: inDomain(
          "task",
          "schema",
          {
            name: "schema",
            kind: "folder",
            hint: h("schema"),
            active: true,
            children: [
              { name: "tasks.schema.ts", kind: "file", active: true },
              { name: "index.ts", kind: "file" },
            ],
          },
          h,
        ),
      };
    case "repository":
      return {
        workspace,
        tree: inDomain(
          "task",
          "repository.ts",
          { name: "repository.ts", kind: "file", hint: h("repository"), active: true },
          h,
        ),
      };
    case "dto":
      return {
        workspace,
        tree: inDomain(
          "task",
          "dto.ts",
          { name: "dto.ts", kind: "file", hint: h("dto"), active: true },
          h,
        ),
      };
    case "routes":
      return {
        workspace,
        tree: inDomain(
          "task",
          "routes",
          {
            name: "routes",
            kind: "folder",
            hint: h("routes"),
            active: true,
            children: [
              { name: "index.ts", kind: "file", hint: h("routeMap"), active: true },
              { name: "tasks.get.route.ts", kind: "file", hint: h("list") },
              { name: "task.post.route.ts", kind: "file", hint: h("create") },
              { name: "task.get.route.ts", kind: "file", hint: h("get") },
            ],
          },
          h,
        ),
      };
    case "tools":
      return {
        workspace,
        tree: inDomain(
          "task",
          "tools",
          {
            name: "tools",
            kind: "folder",
            hint: h("tools"),
            active: true,
            children: [
              { name: "index.ts", kind: "file", hint: h("toolMap"), active: true },
              { name: "create-task.tool.ts", kind: "file", hint: h("action") },
              { name: "list-tasks.tool.ts", kind: "file" },
            ],
          },
          h,
        ),
      };
    case "service":
      return {
        workspace,
        tree: inDomain(
          "auth",
          "service.ts",
          { name: "service.ts", kind: "file", hint: h("service"), active: true },
          h,
        ),
      };
    case "middleware":
      return {
        workspace,
        tree: inDomain(
          "auth",
          "middleware",
          {
            name: "middleware",
            kind: "folder",
            hint: h("middleware"),
            active: true,
            children: [
              { name: "require-auth.middleware.ts", kind: "file", active: true },
              { name: "require-platform-admin.middleware.ts", kind: "file" },
              { name: "index.ts", kind: "file" },
            ],
          },
          h,
        ),
      };
    case "constants":
      return {
        workspace,
        tree: inDomain(
          "billing",
          "constants",
          {
            name: "constants",
            kind: "folder",
            hint: h("constants"),
            active: true,
            children: [
              { name: "plans.constants.ts", kind: "file", active: true },
              { name: "index.ts", kind: "file" },
            ],
          },
          h,
        ),
      };
    case "utils":
      return {
        workspace,
        tree: inDomain(
          "tenant",
          "utils",
          {
            name: "utils",
            kind: "folder",
            hint: h("utils"),
            active: true,
            children: [
              { name: "slug.utils.ts", kind: "file", active: true },
              { name: "index.ts", kind: "file" },
            ],
          },
          h,
        ),
      };
    case "template":
      return {
        workspace,
        tree: inDomain(
          "auth",
          "template",
          {
            name: "template",
            kind: "folder",
            hint: h("template"),
            active: true,
            children: [
              { name: "verify-email.template.ts", kind: "file", active: true },
              { name: "reset-password.template.ts", kind: "file" },
              { name: "index.ts", kind: "file" },
            ],
          },
          h,
        ),
      };
  }
}

/** Web overview — closed domains, task peeks one level. */
export function buildWebTree(t: TFunction): ExplorerNode[] {
  const p = (key: string) => t(`landing.moduleZoom.web.hints.${key}`);
  return [
    {
      name: "src",
      kind: "folder",
      children: [
        {
          name: "domains",
          kind: "folder",
          hint: p("domains"),
          children: [
            { name: "auth", kind: "folder", hint: p("auth") },
            { name: "tenant", kind: "folder", hint: p("tenant") },
            {
              name: "task",
              kind: "folder",
              hint: p("task"),
              active: true,
              children: [
                { name: "api.ts", kind: "file", active: true },
                { name: "pages", kind: "folder" },
                { name: "routes.tsx", kind: "file" },
                { name: "components", kind: "folder" },
              ],
            },
            { name: "article", kind: "folder", hint: p("article") },
            { name: "marketing", kind: "folder", hint: p("marketing") },
            { name: "admin", kind: "folder", hint: p("admin") },
            { name: "agent", kind: "folder", hint: p("agent") },
          ],
        },
        { name: "app", kind: "folder", hint: p("app") },
        { name: "layouts", kind: "folder", hint: p("layouts") },
        { name: "lib", kind: "folder", hint: p("lib") },
        { name: "i18n", kind: "folder", hint: p("i18n") },
        { name: "theme", kind: "folder", hint: p("theme") },
        { name: "brand", kind: "folder", hint: p("brand") },
        { name: "main.tsx", kind: "file" },
      ],
    },
  ];
}

type WebFolderFocus =
  | "domains"
  | "app"
  | "layouts"
  | "lib"
  | "i18n"
  | "theme"
  | "brand"
  | "api"
  | "pages"
  | "routes"
  | "components"
  | "context"
  | "hooks"
  | "constants"
  | "utils";

/**
 * apps/web/src shell: focus expanded, every other top-level entry collapsed + muted.
 */
function webSrcShell(
  focusName: string,
  focus: ExplorerNode,
  h: (k: string) => string,
): ExplorerNode[] {
  const slots: { name: string; kind: "folder" | "file"; hint?: string }[] = [
    { name: "domains", kind: "folder", hint: h("domains") },
    { name: "app", kind: "folder", hint: h("app") },
    { name: "layouts", kind: "folder", hint: h("layouts") },
    { name: "lib", kind: "folder", hint: h("lib") },
    { name: "i18n", kind: "folder", hint: h("i18n") },
    { name: "theme", kind: "folder", hint: h("theme") },
    { name: "brand", kind: "folder", hint: h("brand") },
    { name: "main.tsx", kind: "file", hint: h("main") },
  ];

  return [
    {
      name: "src",
      kind: "folder",
      children: slots.map((slot) =>
        slot.name === focusName
          ? focus
          : { name: slot.name, kind: slot.kind, hint: slot.hint, muted: true },
      ),
    },
  ];
}

/** Roles inside a web domain — only the focus expands; others stay collapsed + muted. */
function webDomainRoles(
  focusName: string,
  focus: ExplorerNode,
  h: (k: string) => string,
): ExplorerNode[] {
  const slots: { name: string; kind: "folder" | "file"; hint: string }[] = [
    { name: "api.ts", kind: "file", hint: h("api") },
    { name: "pages", kind: "folder", hint: h("pages") },
    { name: "routes.tsx", kind: "file", hint: h("routes") },
    { name: "components", kind: "folder", hint: h("components") },
    { name: "context", kind: "folder", hint: h("context") },
    { name: "hooks", kind: "folder", hint: h("hooks") },
    { name: "constants", kind: "folder", hint: h("constants") },
    { name: "utils", kind: "folder", hint: h("utils") },
  ];

  return slots.map((slot) =>
    slot.name === focusName
      ? focus
      : { name: slot.name, kind: slot.kind, hint: slot.hint, muted: true },
  );
}

function inWebDomain(
  domainName: string,
  focusName: string,
  focus: ExplorerNode,
  h: (k: string) => string,
): ExplorerNode[] {
  return webSrcShell(
    "domains",
    domainsShell(
      {
        name: domainName,
        kind: "folder",
        active: true,
        children: webDomainRoles(focusName, focus, h),
      },
      h,
    ),
    h,
  );
}

/**
 * Compact Explorer focused on one web folder — path ancestors open, siblings
 * collapsed + muted so you still see place-in-tree.
 */
export function buildWebFolderTree(
  folder: WebFolderFocus,
  t: TFunction,
): { workspace: string; tree: ExplorerNode[] } {
  const h = (key: string) => t(`landing.webCourse.folderHints.${key}`);
  const workspace = t("landing.moduleZoom.web.workspace");

  switch (folder) {
    case "domains":
      return {
        workspace,
        tree: webSrcShell(
          "domains",
          {
            name: "domains",
            kind: "folder",
            hint: h("domains"),
            active: true,
            children: [
              { name: "task", kind: "folder", hint: h("resource"), active: true },
              { name: "auth", kind: "folder", hint: h("platform") },
              { name: "tenant", kind: "folder", hint: h("shell") },
              { name: "marketing", kind: "folder", hint: h("public") },
              { name: "agent", kind: "folder", hint: h("fab") },
              ctx("admin"),
            ],
          },
          h,
        ),
      };
    case "app":
      return {
        workspace,
        tree: webSrcShell(
          "app",
          {
            name: "app",
            kind: "folder",
            hint: h("app"),
            active: true,
            children: [
              { name: "App.tsx", kind: "file", hint: h("routeMap"), active: true },
              { name: "config.ts", kind: "file", hint: h("flags") },
              { name: "NotFoundPage.tsx", kind: "file" },
            ],
          },
          h,
        ),
      };
    case "layouts":
      return {
        workspace,
        tree: webSrcShell(
          "layouts",
          {
            name: "layouts",
            kind: "folder",
            hint: h("layouts"),
            active: true,
            children: [
              { name: "AppLayout.tsx", kind: "file", hint: h("sidebar"), active: true },
              { name: "AuthLayout.tsx", kind: "file", hint: h("authShell") },
              { name: "RequireAuth.tsx", kind: "file", hint: h("gate") },
            ],
          },
          h,
        ),
      };
    case "lib":
      return {
        workspace,
        tree: webSrcShell(
          "lib",
          {
            name: "lib",
            kind: "folder",
            hint: h("lib"),
            active: true,
            children: [
              { name: "api.ts", kind: "file", hint: h("http"), active: true },
              { name: "utils.ts", kind: "file" },
              { name: "document-meta.ts", kind: "file" },
              { name: "session-token.ts", kind: "file" },
            ],
          },
          h,
        ),
      };
    case "i18n":
      return {
        workspace,
        tree: webSrcShell(
          "i18n",
          {
            name: "i18n",
            kind: "folder",
            hint: h("i18n"),
            active: true,
            children: [
              { name: "index.ts", kind: "file", active: true },
              {
                name: "locales",
                kind: "folder",
                children: [
                  { name: "en.json", kind: "file", hint: h("appCopy") },
                  { name: "pt.json", kind: "file" },
                  { name: "landing.en.json", kind: "file", hint: h("landingCopy") },
                  { name: "landing.pt.json", kind: "file" },
                ],
              },
            ],
          },
          h,
        ),
      };
    case "theme":
      return {
        workspace,
        tree: webSrcShell(
          "theme",
          {
            name: "theme",
            kind: "folder",
            hint: h("theme"),
            active: true,
            children: [{ name: "theme-controls.tsx", kind: "file", active: true }],
          },
          h,
        ),
      };
    case "brand":
      return {
        workspace,
        tree: webSrcShell(
          "brand",
          {
            name: "brand",
            kind: "folder",
            hint: h("brand"),
            active: true,
            children: [
              { name: "logo.tsx", kind: "file", active: true },
              { name: "logo.css", kind: "file" },
            ],
          },
          h,
        ),
      };
    case "api":
      return {
        workspace,
        tree: inWebDomain(
          "task",
          "api.ts",
          { name: "api.ts", kind: "file", hint: h("api"), active: true },
          h,
        ),
      };
    case "pages":
      return {
        workspace,
        tree: inWebDomain(
          "task",
          "pages",
          {
            name: "pages",
            kind: "folder",
            hint: h("pages"),
            active: true,
            children: [{ name: "TasksPage.tsx", kind: "file", active: true }],
          },
          h,
        ),
      };
    case "routes":
      return {
        workspace,
        tree: inWebDomain(
          "task",
          "routes.tsx",
          { name: "routes.tsx", kind: "file", hint: h("routes"), active: true },
          h,
        ),
      };
    case "components":
      return {
        workspace,
        tree: inWebDomain(
          "tenant",
          "components",
          {
            name: "components",
            kind: "folder",
            hint: h("components"),
            active: true,
            children: [
              { name: "role-select.tsx", kind: "file", active: true },
              { name: "members-section.tsx", kind: "file" },
              { name: "invites-section.tsx", kind: "file" },
            ],
          },
          h,
        ),
      };
    case "context":
      return {
        workspace,
        tree: inWebDomain(
          "tenant",
          "context",
          {
            name: "context",
            kind: "folder",
            hint: h("context"),
            active: true,
            children: [{ name: "tenant-provider.tsx", kind: "file", active: true }],
          },
          h,
        ),
      };
    case "hooks":
      return {
        workspace,
        tree: inWebDomain(
          "agent",
          "hooks",
          {
            name: "hooks",
            kind: "folder",
            hint: h("hooks"),
            active: true,
            children: [{ name: "use-audio-recorder.ts", kind: "file", active: true }],
          },
          h,
        ),
      };
    case "constants":
      return {
        workspace,
        tree: inWebDomain(
          "task",
          "constants",
          {
            name: "constants",
            kind: "folder",
            hint: h("constants"),
            active: true,
            children: [
              { name: "<topic>.constants.ts", kind: "file", active: true },
              { name: "index.ts", kind: "file" },
            ],
          },
          h,
        ),
      };
    case "utils":
      return {
        workspace,
        tree: inWebDomain(
          "task",
          "utils",
          {
            name: "utils",
            kind: "folder",
            hint: h("utils"),
            active: true,
            children: [
              { name: "<topic>.utils.ts", kind: "file", active: true },
              { name: "index.ts", kind: "file" },
            ],
          },
          h,
        ),
      };
  }
}

/** apps/api/drizzle/ — where generated migrations live. */
export function buildDrizzleMigrationsTree(t: TFunction): ExplorerNode[] {
  const h = (key: string) => t(`landing.dbCourse.migrateFiles.hints.${key}`);
  return [
    {
      name: "apps",
      kind: "folder",
      children: [
        {
          name: "api",
          kind: "folder",
          children: [
            {
              name: "drizzle.config.ts",
              kind: "file",
              hint: h("config"),
              muted: true,
            },
            {
              name: "drizzle",
              kind: "folder",
              hint: h("out"),
              active: true,
              children: [
                {
                  name: "0000_harsh_paibok.sql",
                  kind: "file",
                  hint: h("sql"),
                  active: true,
                },
                { name: "0001_….sql", kind: "file", hint: h("sql") },
                { name: "···", kind: "file", muted: true },
                {
                  name: "meta",
                  kind: "folder",
                  hint: h("meta"),
                  children: [
                    { name: "_journal.json", kind: "file", hint: h("journal") },
                    { name: "0000_snapshot.json", kind: "file", hint: h("snapshot") },
                  ],
                },
              ],
            },
            {
              name: "src",
              kind: "folder",
              muted: true,
              children: [{ name: "db", kind: "folder", muted: true, hint: h("schema") }],
            },
          ],
        },
      ],
    },
  ];
}

/** Zoom: packages/ui — kit layout by category. */
export function buildUiTree(t: TFunction): ExplorerNode[] {
  const p = (key: string) => t(`landing.moduleZoom.ui.hints.${key}`);
  return [
    {
      name: "src",
      kind: "folder",
      children: [
        {
          name: "primitives",
          kind: "folder",
          hint: p("primitives"),
          children: [
            { name: "button.tsx", kind: "file" },
            { name: "input.tsx", kind: "file" },
            { name: "dialog.tsx", kind: "file" },
          ],
        },
        {
          name: "shell",
          kind: "folder",
          hint: p("shell"),
          active: true,
          children: [
            { name: "sidebar-shell.tsx", kind: "file" },
            { name: "navbar-shell.tsx", kind: "file" },
            { name: "auth-shell.tsx", kind: "file" },
            { name: "brand.tsx", kind: "file" },
          ],
        },
        {
          name: "composites",
          kind: "folder",
          hint: p("composites"),
          children: [
            { name: "chart", kind: "folder" },
            { name: "data-table.tsx", kind: "file" },
            { name: "page-header.tsx", kind: "file" },
            { name: "code-block", kind: "folder" },
          ],
        },
        {
          name: "theme",
          kind: "folder",
          hint: p("theme"),
          children: [
            { name: "theme-provider.tsx", kind: "file" },
            { name: "create-theme.ts", kind: "file" },
          ],
        },
        { name: "lib", kind: "folder", hint: p("lib") },
      ],
    },
  ];
}
