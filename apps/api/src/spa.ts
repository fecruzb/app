/**
 * SPA shell
 *
 * Serves the built web app in production and injects per-route title /
 * description / Open Graph tags so link previews work without running JS.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Context } from "hono";
import { articleRepository } from "@/domains/article/repository";
import { injectHtmlMeta } from "@/lib/html-meta";
import { env } from "@/lib/env";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** English SEO for static marketing routes (crawlers; matches landing.en.json). */
const MARKETING_META: Record<string, { title: string; description: string }> = {
  "/": {
    title: "App Base — The starting point for your next SaaS",
    description:
      "Open-source multi-tenant SaaS template with auth, tenants, email, an AI agent, and a typed monorepo ready to become your product.",
  },
  "/code": {
    title: "Project structure · App Base",
    description:
      "How the monorepo is laid out — workspaces, Turbo, one deploy — then dive into the API or web package.",
  },
  "/code/api": {
    title: "API structure · App Base",
    description:
      "apps/api domain layers — schema, repository, tools, DTOs, and routes — walked as a guided course.",
  },
  "/code/web": {
    title: "Web structure · App Base",
    description: "apps/web — domains that mirror the API, with api.ts, pages, and routes.",
  },
  "/code/environment": {
    title: "Environment · App Base",
    description:
      "Validated .env, local Docker run, and Render deploy from one YAML — configure, run, and ship.",
  },
  "/code/database": {
    title: "Database · App Base",
    description:
      "Postgres modeled in Drizzle — identity, tenancy, billing, usage, articles, and the example resource.",
  },
  "/code/storage": {
    title: "Storage · App Base",
    description:
      "MediaStore with Cloudflare R2 when configured, local disk fallback for development.",
  },
  "/code/i18n": {
    title: "i18n · App Base",
    description:
      "English and Portuguese locale files, useTranslation, and a live language switcher.",
  },
  "/product": {
    title: "Product · App Base",
    description:
      "Auth, workspace, AI agent, account, tenants, billing, and platform admin — the assembled product, area by area.",
  },
  "/product/auth": {
    title: "Auth · App Base",
    description:
      "Sign in, registration with email verification, and password recovery — the auth surfaces you ship.",
  },
  "/product/workspace": {
    title: "Workspace · App Base",
    description: "The tenant app shell — sidebar, switcher, and a home that isn't a blank page.",
  },
  "/product/agent": {
    title: "AI agent · App Base",
    description: "In-app chat that calls tenant-scoped tools — the assistant that gets work done.",
  },
  "/product/account": {
    title: "Account · App Base",
    description: "Profile, security, and MCP API keys — settings for the signed-in user.",
  },
  "/product/tenants": {
    title: "Tenants · App Base",
    description: "Members and invites — bring the rest of the team into a workspace.",
  },
  "/product/billing": {
    title: "Billing · App Base",
    description: "Plans, seats, and AI entitlements — ready to wire to Stripe.",
  },
  "/product/admin": {
    title: "Platform admin · App Base",
    description: "People, invites, and tenants across the whole product from /admin.",
  },
  "/platforms": {
    title: "Platforms · App Base",
    description:
      "One web app, five native shells — Tauri packages apps/web for Windows, Linux, macOS, iOS, and Android.",
  },
  "/platforms/windows": {
    title: "Windows · App Base",
    description:
      "Ship the App Base SPA as a Windows desktop app via the Tauri shell and CI release pipeline.",
  },
  "/platforms/linux": {
    title: "Linux · App Base",
    description: "AppImage builds from apps/desktop — same web UI, remote API, auto-update via R2.",
  },
  "/platforms/macos": {
    title: "macOS · App Base",
    description:
      "Universal macOS desktop shell around apps/web — DMG, updater, and GitHub Actions release.",
  },
  "/platforms/ios": {
    title: "iOS · App Base",
    description:
      "Tauri iOS packaging of apps/web — local Xcode builds with VITE_API_URL and hash routing.",
  },
  "/platforms/android": {
    title: "Android · App Base",
    description:
      "The same thin Tauri mobile shell pattern for Android — one SPA, native container, remote API.",
  },
  "/ui": {
    title: "User Interface · App Base",
    description: "The @app/ui kit — theming, shells, and the component catalog, split by category.",
  },
  "/ui/theming": {
    title: "Theming · App Base",
    description: "Theme tokens, palettes, and light/dark — live on the page.",
  },
  "/ui/brand": {
    title: "Brand & nav · App Base",
    description: "Brand, NavItem, and SiteHeader — the marks that show up in every chrome.",
  },
  "/ui/shells": {
    title: "Shells · App Base",
    description:
      "Sidebar, Navbar, and Auth shells — the layout chrome for app, marketing, and login.",
  },
  "/ui/controls": {
    title: "Controls · App Base",
    description: "Buttons, badges, progress, and sliders — the interactive atoms.",
  },
  "/ui/forms": {
    title: "Forms · App Base",
    description:
      "Labels, inputs, combobox, checkboxes, radios, and switches — then a composed form.",
  },
  "/ui/overlays": {
    title: "Overlays · App Base",
    description: "Cards, avatars, dialogs, and dropdowns — surfaces that float over the page.",
  },
  "/ui/data": {
    title: "Data · App Base",
    description: "Tabs, DataTable, and page chrome — list screens and empty states.",
  },
  "/ui/charts": {
    title: "Charts · App Base",
    description: "Bar, line, and pie charts from @app/ui/chart.",
  },
  "/articles": {
    title: "Articles · App Base",
    description:
      "Stories published by workspaces on this app — browse the public catalog of shared posts.",
  },
};

function excerpt(body: string, max = 160): string {
  const plain = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trim()}…`;
}

function absoluteMediaUrl(maybeRelative?: string | null): string | null {
  if (!maybeRelative) return null;
  if (maybeRelative.startsWith("http")) return maybeRelative;
  const origin = env.appUrl.replace(/\/+$/, "");
  return `${origin}${maybeRelative.startsWith("/") ? "" : "/"}${maybeRelative}`;
}

let cachedShell: string | null = null;

async function readShell(webDist: string): Promise<string> {
  if (!cachedShell) {
    cachedShell = await readFile(path.join(webDist, "index.html"), "utf8");
  }
  return cachedShell;
}

/**
 * Serve spa html
 *
 * Returns index.html with route-specific meta for marketing pages and
 * published articles. Unknown paths still get the home defaults.
 *
 * @param c - Hono context
 * @param webDist - Absolute path to `apps/web/dist`
 * @returns HTML response
 */
export async function serveSpaHtml(c: Context, webDist: string) {
  const pathname = new URL(c.req.url).pathname.replace(/\/+$/, "") || "/";
  const origin = env.appUrl.replace(/\/+$/, "");
  const shell = await readShell(webDist);

  const articleMatch = pathname.match(/^\/articles\/([^/]+)$/);
  if (articleMatch && UUID_RE.test(articleMatch[1]!)) {
    const row = await articleRepository.findPublished(articleMatch[1]!);
    if (row) {
      const coverPath = row.article.coverPath ? `/media${row.article.coverPath}` : null;
      const description = excerpt(row.article.body) || MARKETING_META["/articles"]!.description;
      const html = injectHtmlMeta(shell, {
        title: `${row.article.title} · App Base`,
        description,
        url: `${origin}/articles/${row.article.id}`,
        image: absoluteMediaUrl(coverPath),
        type: "article",
      });
      return c.html(html);
    }
  }

  const page = MARKETING_META[pathname] ?? MARKETING_META["/"]!;
  const html = injectHtmlMeta(shell, {
    title: page.title,
    description: page.description,
    url: `${origin}${pathname === "/" ? "/" : pathname}`,
    type: "website",
  });
  return c.html(html);
}
