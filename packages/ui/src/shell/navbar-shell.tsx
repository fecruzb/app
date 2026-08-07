import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { cn } from "../lib/utils";

/**
 * Public / marketing chrome: sticky top navbar + scrolling main + optional footer.
 * Compose `brand` / `nav` / `actions` the same way as `SiteHeader`.
 */
function NavbarShell({
  brand,
  nav,
  actions,
  footer,
  children,
  className,
  headerClassName,
  maxWidthClassName,
}: {
  brand: ReactNode;
  nav?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Forwarded to `SiteHeader` (e.g. `static` inside a nested browser mock). */
  headerClassName?: string;
  maxWidthClassName?: string;
}) {
  return (
    <div className={cn("flex min-h-screen flex-col", className)}>
      <SiteHeader
        className={headerClassName}
        brand={brand}
        nav={nav}
        actions={actions}
        maxWidthClassName={maxWidthClassName}
      />
      <main className="flex-1">{children}</main>
      {footer}
    </div>
  );
}

export { NavbarShell };
