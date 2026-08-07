import type { TFunction } from "i18next";
import type { ExplorerNode } from "./explorer-preview";

/** Full monorepo — Foundations hero overview. */
export function buildRepoTree(t: TFunction): ExplorerNode[] {
  return [
    {
      name: "apps",
      kind: "folder",
      children: [
        {
          name: "api",
          kind: "folder",
          hint: t("landing.foundationsIntro.preview.api"),
          active: true,
          children: [
            { name: "package.json", kind: "file" },
            { name: "src", kind: "folder", children: [{ name: "index.ts", kind: "file" }] },
          ],
        },
        {
          name: "web",
          kind: "folder",
          hint: t("landing.foundationsIntro.preview.web"),
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
          hint: t("landing.foundationsIntro.preview.shared"),
          children: [{ name: "src", kind: "folder" }],
        },
        {
          name: "ui",
          kind: "folder",
          hint: t("landing.foundationsIntro.preview.ui"),
          children: [{ name: "src", kind: "folder" }],
        },
      ],
    },
    {
      name: ".cursor",
      kind: "folder",
      children: [
        { name: "rules", kind: "folder", hint: t("landing.foundationsIntro.preview.rulesHint") },
      ],
    },
    { name: "render.yaml", kind: "file", hint: t("landing.foundationsIntro.preview.renderHint") },
    { name: "turbo.json", kind: "file", hint: t("landing.foundationsIntro.preview.turboHint") },
    { name: "package.json", kind: "file" },
  ];
}

/** Zoom: apps/api — domains + lib + agent. */
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
            { name: "auth", kind: "folder" },
            { name: "tenant", kind: "folder" },
            {
              name: "task",
              kind: "folder",
              hint: p("task"),
              active: true,
              children: [
                { name: "schema.ts", kind: "file" },
                { name: "repository.ts", kind: "file" },
                { name: "dto.ts", kind: "file" },
                { name: "routes", kind: "folder" },
                { name: "tools", kind: "folder" },
              ],
            },
            { name: "article", kind: "folder" },
            { name: "billing", kind: "folder" },
            { name: "admin", kind: "folder" },
          ],
        },
        {
          name: "lib",
          kind: "folder",
          hint: p("lib"),
          children: [
            { name: "env.ts", kind: "file" },
            { name: "crypto.ts", kind: "file" },
            { name: "media-store.ts", kind: "file" },
          ],
        },
        {
          name: "agent",
          kind: "folder",
          hint: p("agent"),
          children: [
            { name: "assistant.ts", kind: "file" },
            { name: "registry.ts", kind: "file" },
            { name: "routes", kind: "folder" },
          ],
        },
        { name: "integrations", kind: "folder", hint: p("integrations") },
        { name: "db", kind: "folder", hint: p("db") },
        { name: "app.ts", kind: "file" },
        { name: "server.ts", kind: "file" },
      ],
    },
  ];
}

/** Zoom: apps/web — domains mirror the API. */
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
            { name: "auth", kind: "folder" },
            { name: "tenant", kind: "folder" },
            {
              name: "task",
              kind: "folder",
              hint: p("task"),
              active: true,
              children: [
                { name: "api.ts", kind: "file" },
                { name: "routes.tsx", kind: "file" },
                { name: "pages", kind: "folder" },
                { name: "components", kind: "folder" },
              ],
            },
            { name: "article", kind: "folder" },
            { name: "marketing", kind: "folder" },
            { name: "admin", kind: "folder" },
          ],
        },
        { name: "layouts", kind: "folder", hint: p("layouts") },
        { name: "lib", kind: "folder", hint: p("lib") },
        { name: "i18n", kind: "folder", hint: p("i18n") },
        { name: "theme", kind: "folder", hint: p("theme") },
        { name: "main.tsx", kind: "file" },
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
