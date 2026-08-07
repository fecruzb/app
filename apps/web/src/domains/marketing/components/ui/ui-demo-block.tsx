import type { ReactNode } from "react";

/** One live demo block on the UI showcase page. */
export function UiDemoBlock({
  title,
  description,
  importPath,
  children,
}: {
  title: string;
  description: string;
  importPath: string;
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
        <div className="rounded-xl border bg-background p-6 sm:p-8">{children}</div>
      </div>
    </section>
  );
}
