import type { ReactNode } from "react";
import { cn } from "@app/ui/lib/utils";
import { CodeBlock } from "@app/ui/code-block";
import { Window } from "@app/ui/browser-window";

/** One live demo block on the UI showcase page — preview + usage snippet. */
export function UiDemoBlock({
  title,
  description,
  importPath,
  code,
  filename = "example.tsx",
  previewClassName,
  browserLabel,
  children,
}: {
  title: string;
  description: string;
  importPath: string;
  code: string;
  filename?: string;
  /**
   * Preview panel classes. With `browserLabel`, applied to the body inside the
   * browser chrome (e.g. `h-[26rem]` for full-height shells).
   */
  previewClassName?: string;
  /** When set, the preview sits inside the product-preview browser chrome. */
  browserLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
          <p className="mt-2 text-sm text-pretty text-muted-foreground">{description}</p>
          <code className="mt-3 inline-block rounded-md border bg-muted/50 px-2.5 py-1 font-mono text-xs">
            {importPath}
          </code>
        </div>
        <div className="flex flex-col gap-6">
          {browserLabel ? (
            <Window label={browserLabel}>
              <div className={cn("min-h-0 bg-background", previewClassName)}>{children}</div>
            </Window>
          ) : (
            <div className={cn("rounded-xl border bg-background p-6 sm:p-8", previewClassName)}>
              {children}
            </div>
          )}
          <CodeBlock filename={filename} code={code} lang="ts" />
        </div>
      </div>
    </section>
  );
}
