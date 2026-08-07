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

type CodeMenuItem = {
  to: string;
  labelKey: "overview" | "api" | "web" | "ui" | "environment" | "database" | "storage" | "i18n";
};

const packageItems: CodeMenuItem[] = [
  { to: "/structure", labelKey: "overview" },
  { to: "/structure/api", labelKey: "api" },
  { to: "/structure/web", labelKey: "web" },
  { to: "/structure/ui", labelKey: "ui" },
];

const platformItems: CodeMenuItem[] = [
  { to: "/structure/environment", labelKey: "environment" },
  { to: "/structure/database", labelKey: "database" },
  { to: "/structure/storage", labelKey: "storage" },
  { to: "/structure/i18n", labelKey: "i18n" },
];

/**
 * “Code” is a split control: the painted pill navigates to the hub (or opens
 * the menu when already on Code); the chevron always toggles the package menu.
 * The dropdown anchors to the whole pill.
 */
export function CodeNavMenu() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const active = pathname === "/structure" || pathname.startsWith("/structure/");

  function onPillClick(e: MouseEvent) {
    if (!active) return;
    e.preventDefault();
    setOpen(true);
  }

  function renderItems(items: CodeMenuItem[]) {
    return items.map(({ to, labelKey }) => {
      const itemActive = pathname === to;
      return (
        <DropdownMenuItem key={to} asChild>
          <Link to={to} className={itemActive ? "bg-accent text-accent-foreground" : undefined}>
            {t(`landing.nav.codeMenu.${labelKey}`)}
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
          to="/structure"
          onClick={onPillClick}
          className="absolute inset-0 z-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("landing.nav.structure")}
        />

        <span className="relative z-10 pointer-events-none px-1.5 py-0.5" aria-hidden>
          {t("landing.nav.structure")}
        </span>

        <button
          type="button"
          className="relative z-10 rounded-sm p-0.5 outline-none hover:bg-background/60 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("landing.nav.codeMenu.open")}
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

      <DropdownMenuContent align="start" className="min-w-[11rem]">
        {renderItems(packageItems)}
        <DropdownMenuSeparator />
        {renderItems(platformItems)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
