import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRightIcon,
  FolderTreeIcon,
  LayoutDashboardIcon,
  PaletteIcon,
  TerminalIcon,
} from "lucide-react";
import { Button } from "@app/ui/button";
import { Card, CardContent } from "@app/ui/card";
import { useAppConfig } from "@/app/config";
import { useAuth } from "@/domains/auth/context/auth-provider";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingHero } from "../components/marketing-hero";
import { MarketingShell } from "../components/marketing-shell";
import { StackSection } from "../components/landing/stack-section";
import { useReveal } from "../hooks/use-reveal";

export function LandingPage() {
  const { t } = useTranslation();
  const { me } = useAuth();
  const { selfSignupEnabled } = useAppConfig();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.home.title"),
    description: t("landing.seo.home.description"),
    path: "/",
  });

  return (
    <MarketingShell>
      <MarketingHero
        size="lg"
        eyebrow={t("landing.hero.eyebrow")}
        title={t("landing.hero.title")}
        body={t("landing.hero.body")}
      >
        <div className="mx-auto flex w-fit max-w-full items-center gap-2 overflow-x-auto rounded-lg border bg-background/70 px-4 py-3 font-mono text-sm backdrop-blur-sm">
          <TerminalIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">$</span>
          <span className="whitespace-nowrap">{t("landing.hero.clone")}</span>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Button size="lg" asChild>
            <Link to={me ? "/app" : selfSignupEnabled ? "/register" : "/login"}>
              {me ? t("landing.goToApp") : t("landing.tryLiveDemo")} <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </MarketingHero>

      <StackSection />

      <section data-section className="scroll-mt-20 border-t px-4 py-20">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          <Card className="reveal">
            <CardContent className="flex h-full flex-col p-6">
              <FolderTreeIcon className="mb-4 size-5 text-primary" />
              <p className="text-sm font-medium text-primary">
                {t("landing.structureIntro.eyebrow")}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                {t("landing.structureIntro.title")}
              </h2>
              <p className="mt-3 flex-1 text-sm text-pretty text-muted-foreground">
                {t("landing.structureIntro.body")}
              </p>
              <Button variant="outline" className="mt-6 w-fit" asChild>
                <Link to="/code">
                  {t("landing.teasers.exploreStructure")} <ArrowRightIcon />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="reveal reveal-delay">
            <CardContent className="flex h-full flex-col p-6">
              <LayoutDashboardIcon className="mb-4 size-5 text-primary" />
              <p className="text-sm font-medium text-primary">{t("landing.tourIntro.eyebrow")}</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                {t("landing.tourIntro.title")}
              </h2>
              <p className="mt-3 flex-1 text-sm text-pretty text-muted-foreground">
                {t("landing.tourIntro.body")}
              </p>
              <Button variant="outline" className="mt-6 w-fit" asChild>
                <Link to="/product">
                  {t("landing.teasers.exploreTour")} <ArrowRightIcon />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="reveal reveal-delay">
            <CardContent className="flex h-full flex-col p-6">
              <PaletteIcon className="mb-4 size-5 text-primary" />
              <p className="text-sm font-medium text-primary">{t("landing.ui.eyebrow")}</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">{t("landing.ui.title")}</h2>
              <p className="mt-3 flex-1 text-sm text-pretty text-muted-foreground">
                {t("landing.ui.body")}
              </p>
              <Button variant="outline" className="mt-6 w-fit" asChild>
                <Link to="/ui">
                  {t("landing.teasers.exploreUi")} <ArrowRightIcon />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section data-section className="scroll-mt-20 border-t px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            {t("landing.closing.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            {t("landing.closing.body")}
          </p>
          <Button size="lg" className="mt-10" asChild>
            <Link to={me ? "/app" : selfSignupEnabled ? "/register" : "/login"}>
              {me ? t("landing.goToApp") : t("landing.tryLiveDemo")} <ArrowRightIcon />
            </Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">{t("landing.closing.skipDemo")}</p>
        </div>
      </section>
    </MarketingShell>
  );
}
