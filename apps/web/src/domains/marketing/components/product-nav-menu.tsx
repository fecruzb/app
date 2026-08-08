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

type ProductMenuItem = {
  to: string;
  labelKey: "overview" | "auth" | "workspace" | "agent" | "tenants" | "billing" | "admin";
};

const primaryItems: ProductMenuItem[] = [
  { to: "/product", labelKey: "overview" },
  { to: "/product/auth", labelKey: "auth" },
  { to: "/product/workspace", labelKey: "workspace" },
  { to: "/product/agent", labelKey: "agent" },
];

const secondaryItems: ProductMenuItem[] = [
  { to: "/product/tenants", labelKey: "tenants" },
  { to: "/product/billing", labelKey: "billing" },
  { to: "/product/admin", labelKey: "admin" },
];

/**
 * “Product” split control — same pattern as Code: pill → hub, chevron opens
 * the area menu; already-on-Product pill click opens the menu.
 */
export function ProductNavMenu() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const active = pathname === "/product" || pathname.startsWith("/product/");

  function onPillClick(e: MouseEvent) {
    if (!active) return;
    e.preventDefault();
    setOpen(true);
  }

  function renderItems(items: ProductMenuItem[]) {
    return items.map(({ to, labelKey }) => {
      const itemActive = pathname === to;
      return (
        <DropdownMenuItem key={to} asChild>
          <Link to={to} className={itemActive ? "bg-accent text-accent-foreground" : undefined}>
            {t(`landing.nav.productMenu.${labelKey}`)}
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
          to="/product"
          onClick={onPillClick}
          className="absolute inset-0 z-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("landing.nav.tour")}
        />

        <span className="relative z-10 pointer-events-none px-1.5 py-0.5" aria-hidden>
          {t("landing.nav.tour")}
        </span>

        <button
          type="button"
          className="relative z-10 rounded-sm p-0.5 outline-none hover:bg-background/60 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("landing.nav.productMenu.open")}
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
        {renderItems(primaryItems)}
        <DropdownMenuSeparator />
        {renderItems(secondaryItems)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
