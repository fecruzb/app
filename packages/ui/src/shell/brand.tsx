import * as React from "react";
import { cn } from "../lib/utils";

/**
 * Brand mark — logo icon + name (+ optional subtitle). Wrap with a router
 * `<Link>` (or `<a>`) at the call site; this stays presentational and
 * app-neutral.
 */
function Brand({
  className,
  icon,
  subtitle,
  children,
}: {
  className?: string;
  icon?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <span className="flex items-center gap-2 font-semibold">
        {icon}
        <span className="truncate">{children}</span>
      </span>
      {subtitle ? (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
}

export { Brand };
