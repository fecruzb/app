import { useEffect, useState, type ReactNode } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useDefaultLayout,
} from "../primitives/resizable";
import { cn } from "../lib/utils";

/** Matches Tailwind `md:` — resize only applies on desktop. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

export type SidebarShellResize = {
  /** Panel group id (also used as layout persistence key when `storage` is set). */
  id: string;
  storage?: Storage;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  mainMinSize?: number;
};

/**
 * App chrome with a lateral sidebar + main. Pass a composed `<Sidebar>` as
 * `sidebar`. Optional `resizable` enables the desktop drag handle (same UX as
 * the live app); omit it for a fixed-width sidebar (admin-style).
 */
function SidebarShell({
  sidebar,
  banner,
  children,
  className,
  mainClassName,
  sidebarFrameClassName,
  resizable,
}: {
  sidebar: ReactNode;
  /** Optional strip above the main scroll area (e.g. verify-email banner). */
  banner?: ReactNode;
  children: ReactNode;
  className?: string;
  mainClassName?: string;
  /** Frame around the sidebar when not resizable (default `md:w-64 md:border-r`). */
  sidebarFrameClassName?: string;
  resizable?: SidebarShellResize;
}) {
  const main = (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-y-auto">
      {banner}
      <main className={cn("mx-auto w-full max-w-4xl flex-1 p-4 md:p-8", mainClassName)}>
        {children}
      </main>
    </div>
  );

  if (resizable) {
    return (
      <ResizableSidebarShell
        className={className}
        sidebar={sidebar}
        main={main}
        resizable={resizable}
      />
    );
  }

  return (
    <div className={cn("flex h-svh flex-col overflow-hidden md:flex-row", className)}>
      <div className={cn("md:h-full md:w-64 md:border-r", sidebarFrameClassName)}>{sidebar}</div>
      <div className="min-h-0 min-w-0 flex-1">{main}</div>
    </div>
  );
}

function ResizableSidebarShell({
  sidebar,
  main,
  resizable,
  className,
}: {
  sidebar: ReactNode;
  main: ReactNode;
  resizable: SidebarShellResize;
  className?: string;
}) {
  const isDesktop = useIsDesktop();
  const {
    id,
    storage,
    defaultSize = 256,
    minSize = 200,
    maxSize = 400,
    mainMinSize = 360,
  } = resizable;

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id,
    storage,
  });

  if (!isDesktop) {
    return (
      <div className={cn("flex h-svh flex-col overflow-hidden", className)}>
        {sidebar}
        {main}
      </div>
    );
  }

  return (
    <div className={cn("h-svh overflow-hidden", className)}>
      <ResizablePanelGroup
        id={id}
        orientation="horizontal"
        className="h-full"
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
      >
        <ResizablePanel
          id="sidebar"
          className="h-full min-h-0"
          defaultSize={defaultSize}
          minSize={minSize}
          maxSize={maxSize}
        >
          {sidebar}
        </ResizablePanel>
        <ResizableHandle withHandle className="h-full" />
        <ResizablePanel id="main" className="h-full min-h-0" minSize={mainMinSize}>
          {main}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export { SidebarShell };
