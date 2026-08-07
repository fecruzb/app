/**
 * HTML meta helpers
 *
 * Pure string helpers for injecting title / description / Open Graph tags into
 * the SPA shell. No domain or filesystem knowledge.
 */
import { brand } from "@app/shared";

export type HtmlMeta = {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  type?: "website" | "article";
  siteName?: string;
  locale?: string;
};

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function metaTag(attr: "name" | "property", key: string, content: string): string {
  return `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
}

/**
 * Inject spa meta
 *
 * Replaces `<title>` and `meta[name=description]`, then inserts Open Graph /
 * Twitter tags just before `</head>`.
 *
 * @param html - Full HTML document
 * @param meta - Page meta to apply
 * @returns HTML with meta tags updated
 */
export function injectHtmlMeta(html: string, meta: HtmlMeta): string {
  const siteName = meta.siteName ?? brand.displayName;
  const type = meta.type ?? "website";
  const locale = meta.locale ?? "en_US";
  const card = meta.image ? "summary_large_image" : "summary";

  const tags = [
    metaTag("property", "og:title", meta.title),
    metaTag("property", "og:description", meta.description),
    metaTag("property", "og:type", type),
    metaTag("property", "og:url", meta.url),
    metaTag("property", "og:site_name", siteName),
    metaTag("property", "og:locale", locale),
    metaTag("name", "twitter:card", card),
    metaTag("name", "twitter:title", meta.title),
    metaTag("name", "twitter:description", meta.description),
  ];

  if (meta.image) {
    tags.push(metaTag("property", "og:image", meta.image));
    tags.push(metaTag("name", "twitter:image", meta.image));
  }

  let out = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(meta.title)}</title>`);
  out = out.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    metaTag("name", "description", meta.description),
  );

  // Drop any previous OG/Twitter tags so re-injects stay clean.
  out = out.replace(/\s*<meta\s+(?:property|name)=["'](?:og:|twitter:)[^"']+["'][^>]*>/gi, "");

  return out.replace("</head>", `    ${tags.join("\n    ")}\n  </head>`);
}
