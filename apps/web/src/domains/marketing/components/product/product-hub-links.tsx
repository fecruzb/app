import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRightIcon,
  BotIcon,
  Building2Icon,
  CreditCardIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  ShieldIcon,
} from "lucide-react";
import { Button } from "@app/ui/button";
import { Card, CardContent } from "@app/ui/card";
import type { ProductAreaId } from "./chapter-section";

type HubLink = {
  id: Exclude<ProductAreaId, "account">;
  to: string;
  icon: LucideIcon;
};

const links: HubLink[] = [
  { id: "auth", to: "/product/auth", icon: KeyRoundIcon },
  { id: "workspace", to: "/product/workspace", icon: LayoutDashboardIcon },
  { id: "agent", to: "/product/agent", icon: BotIcon },
  { id: "tenants", to: "/product/tenants", icon: Building2Icon },
  { id: "billing", to: "/product/billing", icon: CreditCardIcon },
  { id: "admin", to: "/product/admin", icon: ShieldIcon },
];

/** CTAs from the Product hub into each product area. */
export function ProductHubLinks() {
  const { t } = useTranslation();

  return (
    <section data-section className="scroll-mt-20 border-t px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-medium text-primary">{t("landing.productLinks.eyebrow")}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("landing.productLinks.title")}
        </h2>
        <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
          {t("landing.productLinks.body")}
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {links.map(({ id, to, icon: Icon }, i) => (
            <Card key={id} className={i === 0 ? "reveal" : "reveal reveal-delay"}>
              <CardContent className="flex h-full flex-col p-6">
                <Icon className="mb-4 size-5 text-primary" />
                <p className="text-sm font-medium text-primary">
                  {t(`landing.productLinks.${id}.eyebrow`)}
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">
                  {t(`landing.productLinks.${id}.title`)}
                </h3>
                <p className="mt-3 flex-1 text-sm text-pretty text-muted-foreground">
                  {t(`landing.productLinks.${id}.body`)}
                </p>
                <Button variant="outline" className="mt-6 w-fit" asChild>
                  <Link to={to}>
                    {t(`landing.productLinks.${id}.cta`)} <ArrowRightIcon />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
