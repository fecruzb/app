import * as React from "react";
import { cn } from "../lib/utils";

/**
 * App / admin sidebar shell. Compose with `SidebarHeader` (brand), `SidebarNav`
 * (nav items), and `SidebarFooter` (theme toggles, user menu).
 */
function Sidebar({ className, children, ...props }: React.ComponentProps<"aside">) {
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col gap-4 border-b p-4 md:h-full md:min-h-0 md:border-b-0 md:py-8",
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

function SidebarHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("px-2", className)} {...props}>
      {children}
    </div>
  );
}

function SidebarNav({ className, children, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      className={cn(
        "flex gap-1 overflow-x-auto md:min-h-0 md:flex-1 md:flex-col md:overflow-y-auto",
        className,
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

function SidebarFooter({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("mt-auto flex shrink-0 flex-col gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export { Sidebar, SidebarHeader, SidebarNav, SidebarFooter };
