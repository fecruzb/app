import type { ReactNode } from "react";
import { LockIcon } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Browser chrome bar — traffic-light dots + centered URL pill.
 * Kept fixed while flow bodies swap underneath.
 *
 * Traffic-light colors mimic real OS chrome (not theme tokens).
 */
function WindowBar({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b bg-muted/70 px-3 py-2 dark:bg-muted/40",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="flex min-w-0 flex-1 justify-center">
        <div className="flex h-6 w-full max-w-[min(100%,16rem)] items-center justify-center gap-1.5 rounded-md bg-background/90 px-2.5 text-[11px] text-muted-foreground shadow-sm ring-1 ring-border/70">
          <LockIcon className="size-2.5 shrink-0 opacity-50" aria-hidden />
          <span className="truncate font-mono">{label}</span>
        </div>
      </div>
      {/* Balance the traffic lights so the URL pill stays centered. */}
      <div className="w-[46px] shrink-0" aria-hidden />
    </div>
  );
}

/** Chrome frame so a mock or demo reads like a real browser screenshot. */
function Window({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-md ring-1 ring-foreground/5",
        className,
      )}
    >
      <WindowBar label={label} />
      {children}
    </div>
  );
}

export { Window, WindowBar };
