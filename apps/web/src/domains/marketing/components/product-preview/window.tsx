import type { ReactNode } from "react";

/** Just the browser chrome bar (dots + label), so it can stay fixed while the body swaps. */
export function WindowBar({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
      <span className="size-2.5 rounded-full bg-muted-foreground/25" />
      <span className="size-2.5 rounded-full bg-muted-foreground/25" />
      <span className="size-2.5 rounded-full bg-muted-foreground/25" />
      <span className="ml-2 truncate font-mono text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

/** Chrome frame so a mock reads as a real screen without pretending to be one. */
export function Window({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <WindowBar label={label} />
      {children}
    </div>
  );
}
