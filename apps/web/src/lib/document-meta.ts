import { useEffect } from "react";

type DocumentMeta = {
  title: string;
  description?: string;
  image?: string | null;
  /** Canonical path, e.g. `/articles/uuid`. */
  path?: string;
  /** Open Graph type. Defaults to `website`. */
  type?: "website" | "article";
};

const SITE_NAME = "App Base";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function absoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return `${window.location.origin}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/**
 * Sets document title + Open Graph / Twitter / description meta for public pages.
 * Restores the previous title on unmount.
 */
export function useDocumentMeta({
  title,
  description,
  image,
  path,
  type = "website",
}: DocumentMeta) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;

    upsertMeta("property", "og:title", title);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:site_name", SITE_NAME);

    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
      upsertMeta("name", "twitter:description", description);
    }

    const lang = document.documentElement.lang || "en";
    upsertMeta("property", "og:locale", lang.startsWith("pt") ? "pt_BR" : "en_US");

    if (image) {
      const absolute = absoluteUrl(image);
      upsertMeta("property", "og:image", absolute);
      upsertMeta("name", "twitter:image", absolute);
      upsertMeta("name", "twitter:card", "summary_large_image");
    } else {
      upsertMeta("name", "twitter:card", "summary");
    }

    if (path) {
      const url = absoluteUrl(path);
      upsertMeta("property", "og:url", url);
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = url;
    }

    return () => {
      document.title = previous;
    };
  }, [title, description, image, path, type]);
}
