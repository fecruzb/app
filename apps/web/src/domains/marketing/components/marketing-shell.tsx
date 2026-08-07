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
import { CodeNavMenu } from "./code-nav-menu";
import { PlatformsNavMenu } from "./platforms/platforms-nav-menu";
import { ProductNavMenu } from "./product-nav-menu";
import { UiNavMenu } from "./ui/ui-nav-menu";
import { NextSectionButton } from "./next-section-button";

export function MarketingShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { me } = useAuth();
  const { selfSignupEnabled } = useAppConfig();

  return (
    <NavbarShell
      // Hero atmosphere sits under the sticky bar — no hairline between them.
      headerClassName="border-b-0 bg-background/70"
      brand={
        <Link to="/">
          <Brand icon={<BoxIcon className="size-5 text-primary" />}>{t("brand")}</Brand>
        </Link>
      }
      nav={
        <>
          <CodeNavMenu />
          <ProductNavMenu />
          <PlatformsNavMenu />
          <UiNavMenu />
          <span aria-hidden className="mx-1.5 h-4 w-px shrink-0 bg-border" />
          <HeaderNavLink
            to="/articles"
            example
            className="border border-dashed border-border/80 font-normal hover:border-foreground/25 data-[active=true]:border-solid data-[active=true]:border-border data-[active=true]:bg-muted/50 data-[active=true]:text-foreground"
          >
            {t("landing.nav.articles")}
          </HeaderNavLink>
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
      <NextSectionButton />
    </NavbarShell>
  );
}

function HeaderNavLink({
  to,
  children,
  className,
  example = false,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  /** Softer outline style — live example, not part of the product tour. */
  example?: boolean;
}) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <NavItem
          variant="header"
          // Example links style their own active state so they stay visually distinct.
          active={example ? false : isActive}
          data-active={isActive || undefined}
          className={className}
        >
          {children}
        </NavItem>
      )}
    </NavLink>
  );
}
