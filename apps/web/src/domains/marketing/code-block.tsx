import { useEffect, useState } from "react";
import { CODE_THEME, getHighlighter } from "./highlighter";

type Lang = "ts" | "json" | "text";

/**
 * Editor-style window with Shiki syntax highlighting. Renders the plain code
 * first, then swaps in the highlighted HTML once the highlighter loads.
 */
export function CodeBlock({
  filename,
  code,
  lang = "ts",
}: {
  filename: string;
  code: string;
  lang?: Lang;
}) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (lang === "text") return;
    let active = true;
    getHighlighter()
      .then((hl) => {
        if (!active) return;
        setHtml(
          hl.codeToHtml(code, {
            lang: lang === "json" ? "json" : "typescript",
            theme: CODE_THEME,
          }),
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [code, lang]);

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="ml-2 truncate font-mono text-xs text-muted-foreground">{filename}</span>
      </div>
      {html ? (
        <div
          className="code-block overflow-x-auto p-4 text-xs leading-relaxed sm:text-[13px]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto p-4 text-xs leading-relaxed sm:text-[13px]">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
