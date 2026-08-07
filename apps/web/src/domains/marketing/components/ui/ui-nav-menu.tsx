import { useState, type MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@app/ui/dropdown-menu";
import { cn } from "@app/ui/lib/utils";
import { navItemVariants } from "@app/ui/nav-item";

type UiMenuItem = {
  to: string;
  labelKey:
    | "overview"
    | "theming"
    | "brand"
    | "shells"
    | "controls"
    | "forms"
    | "overlays"
    | "data"
    | "charts";
};

const foundationItems: UiMenuItem[] = [
  { to: "/ui", labelKey: "overview" },
  { to: "/ui/theming", labelKey: "theming" },
  { to: "/ui/brand", labelKey: "brand" },
  { to: "/ui/shells", labelKey: "shells" },
];

const componentItems: UiMenuItem[] = [
  { to: "/ui/controls", labelKey: "controls" },
  { to: "/ui/forms", labelKey: "forms" },
  { to: "/ui/overlays", labelKey: "overlays" },
  { to: "/ui/data", labelKey: "data" },
  { to: "/ui/charts", labelKey: "charts" },
];

/**
 * “User Interface” split control — pill → hub; menu lists foundations then components.
 */
export function UiNavMenu() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const active = pathname === "/ui" || pathname.startsWith("/ui/");

  function onPillClick(e: MouseEvent) {
    if (!active) return;
    e.preventDefault();
    setOpen(true);
  }

  function renderItems(items: UiMenuItem[]) {
    return items.map(({ to, labelKey }) => {
      const itemActive = pathname === to;
      return (
        <DropdownMenuItem key={to} asChild>
          <Link to={to} className={itemActive ? "bg-accent text-accent-foreground" : undefined}>
            {t(`landing.nav.uiMenu.${labelKey}`)}
          </Link>
        </DropdownMenuItem>
      );
    });
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <div
        className={cn(navItemVariants({ variant: "header", active }), "relative gap-0.5 pr-1.5")}
      >
        <DropdownMenuTrigger asChild>
          <span className="pointer-events-none absolute inset-0" aria-hidden tabIndex={-1} />
        </DropdownMenuTrigger>

        <Link
          to="/ui"
          onClick={onPillClick}
          className="absolute inset-0 z-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("landing.nav.userInterface")}
        />

        <span className="relative z-10 pointer-events-none px-1.5 py-0.5" aria-hidden>
          {t("landing.nav.userInterface")}
        </span>

        <button
          type="button"
          className="relative z-10 rounded-sm p-0.5 outline-none hover:bg-background/60 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("landing.nav.uiMenu.open")}
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((v) => !v);
          }}
        >
          <ChevronDownIcon className="size-3.5 opacity-60" aria-hidden />
        </button>
      </div>

      <DropdownMenuContent align="start" className="min-w-[12rem]">
        {renderItems(foundationItems)}
        <DropdownMenuSeparator />
        {renderItems(componentItems)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
