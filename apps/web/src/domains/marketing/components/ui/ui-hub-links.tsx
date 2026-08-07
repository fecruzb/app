import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRightIcon,
  BarChart3Icon,
  FormInputIcon,
  LayersIcon,
  LayoutTemplateIcon,
  MousePointerClickIcon,
  PaletteIcon,
  PanelLeftIcon,
  TableIcon,
} from "lucide-react";
import { Button } from "@app/ui/button";
import { Card, CardContent } from "@app/ui/card";
import type { UiCategoryId } from "./ui-categories";

type HubLink = {
  id: UiCategoryId;
  to: string;
  icon: LucideIcon;
};

const foundationLinks: HubLink[] = [
  { id: "theming", to: "/ui/theming", icon: PaletteIcon },
  { id: "brand", to: "/ui/brand", icon: LayersIcon },
  { id: "shells", to: "/ui/shells", icon: PanelLeftIcon },
];

const componentLinks: HubLink[] = [
  { id: "controls", to: "/ui/controls", icon: MousePointerClickIcon },
  { id: "forms", to: "/ui/forms", icon: FormInputIcon },
  { id: "overlays", to: "/ui/overlays", icon: LayoutTemplateIcon },
  { id: "data", to: "/ui/data", icon: TableIcon },
  { id: "charts", to: "/ui/charts", icon: BarChart3Icon },
];

function HubCardGrid({ links }: { links: HubLink[] }) {
  const { t } = useTranslation();
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {links.map(({ id, to, icon: Icon }, i) => (
        <Card key={id} className={i === 0 ? "reveal" : "reveal reveal-delay"}>
          <CardContent className="flex h-full flex-col p-6">
            <Icon className="mb-4 size-5 text-primary" />
            <p className="text-sm font-medium text-primary">{t(`landing.uiLinks.${id}.eyebrow`)}</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">
              {t(`landing.uiLinks.${id}.title`)}
            </h3>
            <p className="mt-3 flex-1 text-sm text-pretty text-muted-foreground">
              {t(`landing.uiLinks.${id}.body`)}
            </p>
            <Button variant="outline" className="mt-6 w-fit" asChild>
              <Link to={to}>
                {t(`landing.uiLinks.${id}.cta`)} <ArrowRightIcon />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** CTAs from the User Interface hub into category deep-dives. */
export function UiHubLinks() {
  const { t } = useTranslation();

  return (
    <>
      <section data-section className="scroll-mt-20 border-t px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">
            {t("landing.uiLinks.foundationEyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("landing.uiLinks.foundationTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
            {t("landing.uiLinks.foundationBody")}
          </p>
          <HubCardGrid links={foundationLinks} />
        </div>
      </section>

      <section data-section className="scroll-mt-20 border-t px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">
            {t("landing.uiLinks.componentEyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("landing.uiLinks.componentTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
            {t("landing.uiLinks.componentBody")}
          </p>
          <HubCardGrid links={componentLinks} />
        </div>
      </section>
    </>
  );
}
