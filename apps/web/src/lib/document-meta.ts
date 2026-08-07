import { useEffect } from "react";

type DocumentMeta = {
  title: string;
  description?: string;
  image?: string | null;
  /** Canonical path, e.g. `/articles/uuid`. */
  path?: string;
};

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

/**
 * Sets document title + Open Graph / Twitter / description meta for public pages.
 * Restores the default title on unmount.
 */
export function useDocumentMeta({ title, description, image, path }: DocumentMeta) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;

    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
      upsertMeta("name", "twitter:description", description);
    }
    upsertMeta("property", "og:title", title);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("property", "og:type", "article");
    if (image) {
      const absolute = image.startsWith("http") ? image : `${window.location.origin}${image}`;
      upsertMeta("property", "og:image", absolute);
      upsertMeta("name", "twitter:image", absolute);
      upsertMeta("name", "twitter:card", "summary_large_image");
    }
    if (path) {
      upsertMeta("property", "og:url", `${window.location.origin}${path}`);
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = `${window.location.origin}${path}`;
    }

    return () => {
      document.title = previous;
    };
  }, [title, description, image, path]);
}
