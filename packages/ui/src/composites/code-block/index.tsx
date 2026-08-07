import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { ScaledContent } from "../content-scale";
import { getHighlighter } from "./highlighter";
import "./code-block.css";

type Lang = "ts" | "json" | "text";

/** Tracks `html.dark` — same switch ThemeProvider toggles for the rest of the kit. */
function useDocumentDark(): boolean {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false,
  );

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return dark;
}

/**
 * Editor-style window with Shiki syntax highlighting. Follows the host app's
 * `html.dark` class (set by ThemeProvider) so light/dark stay in sync with the
 * rest of `@app/ui`.
 */
function CodeBlock({
  filename,
  code,
  lang = "ts",
  className,
}: {
  filename: string;
  code: string;
  lang?: Lang;
  className?: string;
}) {
  const dark = useDocumentDark();
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (lang === "text") {
      setHtml(null);
      return;
    }
    let active = true;
    getHighlighter()
      .then((hl) => {
        if (!active) return;
        setHtml(
          hl.codeToHtml(code, {
            lang: lang === "json" ? "json" : "typescript",
            theme: dark ? "github-dark" : "github-light",
          }),
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [code, lang, dark]);

  return (
    <div
      data-slot="code-block"
      className={cn(
        "overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      {/* Title bar stays at 1× — ContentScaleProvider zooms only the body. */}
      <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-muted-foreground/25" aria-hidden />
        <span className="size-2.5 rounded-full bg-muted-foreground/25" aria-hidden />
        <span className="size-2.5 rounded-full bg-muted-foreground/25" aria-hidden />
        <span className="ml-2 truncate font-mono text-xs text-muted-foreground">{filename}</span>
      </div>
      <ScaledContent>
        {html ? (
          <div
            className="overflow-x-auto p-4 text-xs leading-relaxed sm:text-[13px]"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-foreground sm:text-[13px]">
            <code>{code}</code>
          </pre>
        )}
      </ScaledContent>
    </div>
  );
}

export { CodeBlock };
export type { Lang as CodeBlockLang };
