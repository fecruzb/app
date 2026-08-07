import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRightIcon,
  CloudIcon,
  DatabaseIcon,
  LanguagesIcon,
  LayoutIcon,
  PaletteIcon,
  ServerIcon,
  SlidersIcon,
} from "lucide-react";
import { Button } from "@app/ui/button";
import { Card, CardContent } from "@app/ui/card";

type HubLink = {
  id: string;
  to: string;
  icon: LucideIcon;
  /** Show path eyebrow (packages) vs plain label. */
  pathKey?: boolean;
};

const packageLinks: HubLink[] = [
  { id: "api", to: "/structure/api", icon: ServerIcon, pathKey: true },
  { id: "web", to: "/structure/web", icon: LayoutIcon, pathKey: true },
  { id: "ui", to: "/structure/ui", icon: PaletteIcon, pathKey: true },
];

const platformLinks: HubLink[] = [
  { id: "environment", to: "/structure/environment", icon: SlidersIcon },
  { id: "database", to: "/structure/database", icon: DatabaseIcon },
  { id: "storage", to: "/structure/storage", icon: CloudIcon },
  { id: "i18n", to: "/structure/i18n", icon: LanguagesIcon },
];

function HubCardGrid({ links }: { links: HubLink[] }) {
  const { t } = useTranslation();
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {links.map(({ id, to, icon: Icon, pathKey }, i) => (
        <Card key={id} className={i === 0 ? "reveal" : "reveal reveal-delay"}>
          <CardContent className="flex h-full flex-col p-6">
            <Icon className="mb-4 size-5 text-primary" />
            <p
              className={
                pathKey
                  ? "font-mono text-xs font-medium text-primary"
                  : "text-sm font-medium text-primary"
              }
            >
              {t(`landing.structureLinks.${id}.${pathKey ? "path" : "eyebrow"}`)}
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">
              {t(`landing.structureLinks.${id}.title`)}
            </h3>
            <p className="mt-3 flex-1 text-sm text-pretty text-muted-foreground">
              {t(`landing.structureLinks.${id}.body`)}
            </p>
            <Button variant="outline" className="mt-6 w-fit" asChild>
              <Link to={to}>
                {t(`landing.structureLinks.${id}.cta`)} <ArrowRightIcon />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** CTAs from the Structure hub into package + platform deep-dives. */
export function StructureHubLinks() {
  const { t } = useTranslation();

  return (
    <>
      <section data-section className="scroll-mt-20 border-t px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">{t("landing.structureLinks.eyebrow")}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("landing.structureLinks.title")}
          </h2>
          <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
            {t("landing.structureLinks.body")}
          </p>
          <HubCardGrid links={packageLinks} />
        </div>
      </section>

      <section data-section className="scroll-mt-20 border-t px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">
            {t("landing.structureLinks.platformEyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("landing.structureLinks.platformTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
            {t("landing.structureLinks.platformBody")}
          </p>
          <HubCardGrid links={platformLinks} />
        </div>
      </section>
    </>
  );
}
