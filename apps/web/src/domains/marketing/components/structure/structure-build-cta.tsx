import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@app/ui/button";

/**
 * Hub closer — what you saw is the template; build your own models next via the API.
 */
export function StructureBuildCta() {
  const { t } = useTranslation();

  return (
    <section data-section className="scroll-mt-20 border-t px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">{t("landing.structureBuild.eyebrow")}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {t("landing.structureBuild.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
          {t("landing.structureBuild.body")}
        </p>
        <Button size="lg" className="mt-8" asChild>
          <Link to="/structure/api">
            {t("landing.structureBuild.cta")} <ArrowRightIcon />
          </Link>
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">{t("landing.structureBuild.hint")}</p>
      </div>
    </section>
  );
}
