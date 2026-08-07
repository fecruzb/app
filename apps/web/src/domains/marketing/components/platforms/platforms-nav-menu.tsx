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

type PlatformsMenuItem = {
  to: string;
  labelKey: "overview" | "windows" | "linux" | "macos" | "ios" | "android";
};

const desktopItems: PlatformsMenuItem[] = [
  { to: "/platforms", labelKey: "overview" },
  { to: "/platforms/windows", labelKey: "windows" },
  { to: "/platforms/linux", labelKey: "linux" },
  { to: "/platforms/macos", labelKey: "macos" },
];

const mobileItems: PlatformsMenuItem[] = [
  { to: "/platforms/ios", labelKey: "ios" },
  { to: "/platforms/android", labelKey: "android" },
];

/**
 * “Platforms” split control — pill → hub; menu lists desktop then mobile OS targets.
 */
export function PlatformsNavMenu() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const active = pathname === "/platforms" || pathname.startsWith("/platforms/");

  function onPillClick(e: MouseEvent) {
    if (!active) return;
    e.preventDefault();
    setOpen(true);
  }

  function renderItems(items: PlatformsMenuItem[]) {
    return items.map(({ to, labelKey }) => {
      const itemActive = pathname === to;
      return (
        <DropdownMenuItem key={to} asChild>
          <Link to={to} className={itemActive ? "bg-accent text-accent-foreground" : undefined}>
            {t(`landing.nav.platformsMenu.${labelKey}`)}
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
          to="/platforms"
          onClick={onPillClick}
          className="absolute inset-0 z-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("landing.nav.platforms")}
        />

        <span className="relative z-10 pointer-events-none px-1.5 py-0.5" aria-hidden>
          {t("landing.nav.platforms")}
        </span>

        <button
          type="button"
          className="relative z-10 rounded-sm p-0.5 outline-none hover:bg-background/60 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("landing.nav.platformsMenu.open")}
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
        {renderItems(desktopItems)}
        <DropdownMenuSeparator />
        {renderItems(mobileItems)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
