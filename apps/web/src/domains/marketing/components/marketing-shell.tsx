import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRightIcon, BoxIcon } from "lucide-react";
import { Button } from "@app/ui/button";
import { cn } from "@app/ui/lib/utils";
import { useAppConfig } from "@/app/config";
import { useAuth } from "@/domains/auth/context/auth-provider";
import { ThemeControls } from "@/theme/theme-controls";

export function MarketingShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { me } = useAuth();
  const { selfSignupEnabled } = useAppConfig();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <BoxIcon className="size-5 text-primary" />
              {t("brand")}
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              <MarketingNavLink to="/foundations">{t("landing.nav.foundations")}</MarketingNavLink>
              <MarketingNavLink to="/tour">{t("landing.nav.tour")}</MarketingNavLink>
              <MarketingNavLink to="/ui">{t("landing.nav.ui")}</MarketingNavLink>
            </nav>
          </div>
          <nav className="flex items-center gap-2">
            <ThemeControls className="mr-1" />
            {me ? (
              <Button asChild>
                <Link to="/app">
                  {t("landing.goToApp")} <ArrowRightIcon />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">{t("landing.signIn")}</Link>
                </Button>
                {selfSignupEnabled && (
                  <Button asChild>
                    <Link to="/register">{t("landing.tryDemo")}</Link>
                  </Button>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 text-sm text-muted-foreground">
          <span>{t("landing.footer.copyright", { year: new Date().getFullYear() })}</span>
          <span>{t("landing.footer.builtWith")}</span>
        </div>
      </footer>
    </div>
  );
}

function MarketingNavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "rounded-md px-3 py-1.5 text-sm transition-colors",
          isActive
            ? "bg-muted font-medium text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )
      }
    >
      {children}
    </NavLink>
  );
}
