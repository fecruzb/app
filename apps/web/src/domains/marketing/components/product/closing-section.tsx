import { type ComponentType } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ArrowRightIcon, EraserIcon, PenLineIcon, UnlockIcon } from "lucide-react";
import { Button } from "@app/ui/button";
import { Card, CardContent } from "@app/ui/card";
import { useAppConfig } from "@/app/config";
import { useAuth } from "@/domains/auth/context/auth-provider";

type Included = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

function buildOwnership(t: TFunction): Included[] {
  return [
    {
      icon: EraserIcon,
      title: t("landing.ownership.delete.title"),
      description: t("landing.ownership.delete.description"),
    },
    {
      icon: UnlockIcon,
      title: t("landing.ownership.unsubscribe.title"),
      description: t("landing.ownership.unsubscribe.description"),
    },
    {
      icon: PenLineIcon,
      title: t("landing.ownership.rules.title"),
      description: t("landing.ownership.rules.description"),
    },
  ];
}

export function ClosingSection() {
  const { t } = useTranslation();
  const { me } = useAuth();
  const { selfSignupEnabled } = useAppConfig();
  const ownership = buildOwnership(t);

  return (
    <section className="border-t px-4 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-balance">
          {t("landing.closing.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
          {t("landing.closing.body")}
        </p>
        <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
          {ownership.map((item) => (
            <Card key={item.title} className="reveal">
              <CardContent className="p-5">
                <item.icon className="mb-3 size-5 text-primary" />
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button size="lg" className="mt-10" asChild>
          <Link to={me ? "/app" : selfSignupEnabled ? "/register" : "/login"}>
            {me ? t("landing.goToApp") : t("landing.tryLiveDemo")} <ArrowRightIcon />
          </Link>
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">{t("landing.closing.skipDemo")}</p>
      </div>
    </section>
  );
}
