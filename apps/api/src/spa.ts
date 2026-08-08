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
import { brand } from "@app/shared";
import { env } from "@/lib/env";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** English SEO for static marketing routes (crawlers; matches landing.en.json). */
const MARKETING_META: Record<string, { title: string; description: string }> = {
  "/": {
    title: `${brand.displayName} — ${brand.tagline}`,
    description:
      "Open-source multi-tenant SaaS template with auth, tenants, email, an AI agent, and a typed monorepo ready to become your product.",
  },
  "/code": {
    title: `Project structure · ${brand.displayName}`,
    description:
      "How the monorepo is laid out — workspaces, Turbo, one deploy — then dive into the API or web package.",
  },
  "/code/api": {
    title: `API structure · ${brand.displayName}`,
    description:
      "apps/api domain layers — schema, repository, tools, DTOs, and routes — walked as a guided course.",
  },
  "/code/web": {
    title: `Web structure · ${brand.displayName}`,
    description: "apps/web — domains that mirror the API, with api.ts, pages, and routes.",
  },
  "/code/environment": {
    title: `Environment · ${brand.displayName}`,
    description:
      "Validated .env, local Docker run, and Render deploy from one YAML — configure, run, and ship.",
  },
  "/code/database": {
    title: `Database · ${brand.displayName}`,
    description:
      "Postgres modeled in Drizzle — identity, tenancy, billing, usage, articles, and the example resource.",
  },
  "/code/storage": {
    title: `Storage · ${brand.displayName}`,
    description:
      "MediaStore with Cloudflare R2 when configured, local disk fallback for development.",
  },
  "/code/openai": {
    title: `AI Agent · ${brand.displayName}`,
    description:
      "Optional OPENAI_API_KEY, the tool-calling loop, and how the in-app agent degrades without a key.",
  },
  "/code/resend": {
    title: `Mailing · ${brand.displayName}`,
    description:
      "Optional RESEND_API_KEY, verified sending domain, and console fallback when the key is missing.",
  },
  "/code/domain": {
    title: `Domain · ${brand.displayName}`,
    description:
      "Custom domain on Render: add the host, CNAME at your registrar, wait for the certificate, set APP_URL.",
  },
  "/code/i18n": {
    title: `Translation · ${brand.displayName}`,
    description:
      "English and Portuguese locale files, useTranslation, and a live language switcher.",
  },
  "/product": {
    title: `Product · ${brand.displayName}`,
    description:
      "Auth, workspace, AI agent, tenants, billing, and platform admin — the assembled product, area by area.",
  },
  "/product/auth": {
    title: `Auth · ${brand.displayName}`,
    description:
      "Sign in, registration with email verification, and password recovery — the auth surfaces you ship.",
  },
  "/product/workspace": {
    title: `Workspace · ${brand.displayName}`,
    description:
      "Authenticated shell — sidebar, tenant switcher, user menu, logout, and My account.",
  },
  "/product/agent": {
    title: `AI agent · ${brand.displayName}`,
    description:
      "In-app assistant plus MCP API keys for external agents like Claude Code and Cursor.",
  },
  "/product/account": {
    title: `Workspace · ${brand.displayName}`,
    description:
      "Authenticated shell — sidebar, tenant switcher, user menu, logout, and My account.",
  },
  "/product/tenants": {
    title: `Tenants · ${brand.displayName}`,
    description:
      "Turn a single-purpose app into a platform for many customers — or keep one workspace. Same template, both modes.",
  },
  "/product/billing": {
    title: `Billing · ${brand.displayName}`,
    description: "Plans, seats, and AI entitlements — ready to wire to Stripe.",
  },
  "/product/admin": {
    title: `Platform admin · ${brand.displayName}`,
    description: "People, invites, and tenants across the whole product from /admin.",
  },
  "/platforms": {
    title: `Platforms · ${brand.displayName}`,
    description:
      "One web app, five native shells — Tauri packages apps/web for Windows, Linux, macOS, iOS, and Android.",
  },
  "/platforms/windows": {
    title: `Windows · ${brand.displayName}`,
    description: `Ship the ${brand.displayName} SPA as a Windows desktop app via the Tauri shell and CI release pipeline.`,
  },
  "/platforms/linux": {
    title: `Linux · ${brand.displayName}`,
    description: "AppImage builds from apps/desktop — same web UI, remote API, auto-update via R2.",
  },
  "/platforms/macos": {
    title: `macOS · ${brand.displayName}`,
    description:
      "Universal macOS desktop shell around apps/web — DMG, updater, and GitHub Actions release.",
  },
  "/platforms/ios": {
    title: `iOS · ${brand.displayName}`,
    description:
      "Tauri iOS packaging of apps/web — local Xcode builds with VITE_API_URL and hash routing.",
  },
  "/platforms/android": {
    title: `Android · ${brand.displayName}`,
    description:
      "The same thin Tauri mobile shell pattern for Android — one SPA, native container, remote API.",
  },
  "/ui": {
    title: `User Interface · ${brand.displayName}`,
    description: "The @app/ui kit — theming, shells, and the component catalog, split by category.",
  },
  "/ui/theming": {
    title: `Theming · ${brand.displayName}`,
    description: "Theme tokens, palettes, and light/dark — live on the page.",
  },
  "/ui/brand": {
    title: `Brand & nav · ${brand.displayName}`,
    description: "Brand, NavItem, and SiteHeader — the marks that show up in every chrome.",
  },
  "/ui/shells": {
    title: `Shells · ${brand.displayName}`,
    description:
      "Sidebar, Navbar, and Auth shells — the layout chrome for app, marketing, and login.",
  },
  "/ui/controls": {
    title: `Controls · ${brand.displayName}`,
    description: "Buttons, badges, progress, and sliders — the interactive atoms.",
  },
  "/ui/forms": {
    title: `Forms · ${brand.displayName}`,
    description:
      "Labels, inputs, combobox, checkboxes, radios, and switches — then a composed form.",
  },
  "/ui/overlays": {
    title: `Overlays · ${brand.displayName}`,
    description: "Cards, avatars, dialogs, and dropdowns — surfaces that float over the page.",
  },
  "/ui/data": {
    title: `Data · ${brand.displayName}`,
    description: "Tabs, DataTable, and page chrome — list screens and empty states.",
  },
  "/ui/charts": {
    title: `Charts · ${brand.displayName}`,
    description: "Bar, line, and pie charts from @app/ui/chart.",
  },
  "/articles": {
    title: `Articles · ${brand.displayName}`,
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
        title: `${row.article.title} · ${brand.displayName}`,
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
