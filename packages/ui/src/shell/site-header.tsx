import * as React from "react";
import { cn } from "../lib/utils";

/**
 * Sticky public/site header chrome: brand + optional nav + trailing actions
 * (theme toggles, sign-in). Composition only — no product copy.
 */
function SiteHeader({
  className,
  brand,
  nav,
  actions,
  maxWidthClassName = "max-w-5xl",
}: {
  className?: string;
  brand: React.ReactNode;
  nav?: React.ReactNode;
  actions?: React.ReactNode;
  /** Tailwind max-width utility for the inner row (default `max-w-5xl`). */
  maxWidthClassName?: string;
}) {
  return (
    <header
      className={cn("sticky top-0 z-10 border-b bg-background/80 backdrop-blur", className)}
    >
      <div
        className={cn(
          "mx-auto flex h-16 w-full items-center justify-between gap-4 px-4",
          maxWidthClassName,
        )}
      >
        <div className="flex min-w-0 items-center gap-6">
          {brand}
          {nav ? <nav className="hidden items-center gap-1 sm:flex">{nav}</nav> : null}
        </div>
        {actions ? <nav className="flex shrink-0 items-center gap-2">{actions}</nav> : null}
      </div>
    </header>
  );
}

export { SiteHeader };
