import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRightIcon,
  CopyIcon,
  FolderTreeIcon,
  LayoutDashboardIcon,
  PaletteIcon,
  TerminalIcon,
} from "lucide-react";
import { siGithub } from "simple-icons";
import { toast } from "sonner";
import { brand } from "@app/shared";
import { Button } from "@app/ui/button";
import { Card, CardContent } from "@app/ui/card";
import { useAppConfig } from "@/app/config";
import { useAuth } from "@/domains/auth/context/auth-provider";
import { AppLogo } from "@/brand/logo";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingHero } from "../components/marketing-hero";
import { MarketingShell } from "../components/marketing-shell";
import { StackSection } from "../components/landing/stack-section";
import { useReveal } from "../hooks/use-reveal";

async function copyToClipboard(text: string, copied: string, failed: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(copied);
  } catch {
    toast.error(failed);
  }
}

export function LandingPage() {
  const { t } = useTranslation();
  const { me } = useAuth();
  const { selfSignupEnabled } = useAppConfig();
  const cloneCommand = t("landing.hero.clone");
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
        mark={<AppLogo animated className="size-20 sm:size-24 md:size-28" />}
        title={t("landing.hero.title")}
        body={t("landing.hero.body")}
      >
        <div className="mx-auto flex w-full max-w-xl flex-col items-stretch gap-3 sm:max-w-none sm:w-fit sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-2 rounded-lg border bg-background/70 px-3 py-2 font-mono text-sm backdrop-blur-sm sm:px-4 sm:py-3">
            <TerminalIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">$</span>
            <span className="min-w-0 flex-1 truncate sm:flex-none sm:whitespace-nowrap">
              {cloneCommand}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={() =>
                void copyToClipboard(
                  cloneCommand,
                  t("landing.hero.copied"),
                  t("landing.hero.copyFailed"),
                )
              }
            >
              <CopyIcon />
              <span className="sr-only">{t("landing.hero.copy")}</span>
            </Button>
          </div>
          <Button variant="outline" className="shrink-0 bg-background/70 backdrop-blur-sm" asChild>
            <a href={brand.repoUrl} target="_blank" rel="noopener noreferrer">
              <svg
                role="img"
                aria-hidden
                viewBox="0 0 24 24"
                className="size-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d={siGithub.path} />
              </svg>
              {t("landing.hero.github")}
            </a>
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
