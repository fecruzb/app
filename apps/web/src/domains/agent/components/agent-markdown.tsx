import Markdown from "react-markdown";
import { cn } from "@app/ui/lib/utils";

/** Bare cover paths the agent puts in replies (not wrapped as markdown images). */
const MEDIA_URL_RE = /(?:^|\s)(\/media\/\S+\.(?:webp|png|jpe?g))(?=\s|$)/g;

/** Turn plain `/media/...` paths into markdown images so they render inline. */
function withMediaImages(markdown: string): string {
  return markdown.replace(MEDIA_URL_RE, (_match, url: string) => `\n\n![](${url})\n\n`);
}

/**
 * Compact Markdown renderer for assistant chat bubbles (bold, lists, links,
 * inline code, and generated cover images).
 */
export function AgentMarkdown({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn("agent-md text-sm", className)}>
      <Markdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>,
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-snug">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              {children}
            </a>
          ),
          code: ({ children, className: codeClass }) => {
            const block = Boolean(codeClass);
            if (block) {
              return (
                <code className="mb-2 block overflow-x-auto rounded-md bg-background/60 px-2 py-1.5 font-mono text-xs last:mb-0">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-background/60 px-1 py-0.5 font-mono text-[0.85em]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          img: ({ src, alt }) => (
            <img src={src} alt={alt ?? ""} className="mt-2 max-w-full rounded-md" />
          ),
        }}
      >
        {withMediaImages(content)}
      </Markdown>
    </div>
  );
}
