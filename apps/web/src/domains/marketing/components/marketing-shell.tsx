import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRightIcon, BoxIcon } from "lucide-react";
import { Brand } from "@app/ui/brand";
import { Button } from "@app/ui/button";
import { NavItem } from "@app/ui/nav-item";
import { NavbarShell } from "@app/ui/navbar-shell";
import { useAppConfig } from "@/app/config";
import { useAuth } from "@/domains/auth/context/auth-provider";
import { ThemeControls } from "@/theme/theme-controls";

export function MarketingShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { me } = useAuth();
  const { selfSignupEnabled } = useAppConfig();

  return (
    <NavbarShell
      brand={
        <Link to="/">
          <Brand icon={<BoxIcon className="size-5 text-primary" />}>{t("brand")}</Brand>
        </Link>
      }
      nav={
        <>
          <HeaderNavLink to="/foundations">{t("landing.nav.foundations")}</HeaderNavLink>
          <HeaderNavLink to="/articles">{t("landing.nav.articles")}</HeaderNavLink>
          <HeaderNavLink to="/tour">{t("landing.nav.tour")}</HeaderNavLink>
          <HeaderNavLink to="/ui">{t("landing.nav.ui")}</HeaderNavLink>
        </>
      }
      actions={
        <>
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
        </>
      }
      footer={
        <footer className="border-t">
          <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 text-sm text-muted-foreground">
            <span>{t("landing.footer.copyright", { year: new Date().getFullYear() })}</span>
            <span>{t("landing.footer.builtWith")}</span>
          </div>
        </footer>
      }
    >
      {children}
    </NavbarShell>
  );
}

function HeaderNavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <NavItem variant="header" active={isActive}>
          {children}
        </NavItem>
      )}
    </NavLink>
  );
}
