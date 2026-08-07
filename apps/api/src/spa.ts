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
  "/foundations": {
    title: "Foundations · App Base",
    description:
      "Monorepo layout, database schema, theming, i18n, and one resource walked top to bottom — the groundwork already wired.",
  },
  "/tour": {
    title: "Product tour · App Base",
    description:
      "Auth, invites, workspace shell, tasks, billing, admin, email, and the AI agent — the assembled product, screen by screen.",
  },
  "/ui": {
    title: "UI kit · App Base",
    description:
      "Base components from @app/ui — shadcn primitives and composites, themed by tokens, ready to ship with your product.",
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
