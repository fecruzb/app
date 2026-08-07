import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { CheckIcon, DatabaseIcon } from "lucide-react";
import { points } from "@/i18n";
import {
  AuthTables,
  ArticleTables,
  PlansCatalog,
  PlatformTables,
  TenantTables,
  UsageTables,
} from "../product-preview";

export type DbGroup = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  visual: ReactNode;
};

function dbGroupCopy(
  key: "identity" | "tenancy" | "billing" | "usage" | "articles" | "platform",
  t: TFunction,
) {
  return {
    eyebrow: t(`landing.db.${key}.eyebrow`),
    title: t(`landing.db.${key}.title`),
    body: t(`landing.db.${key}.body`),
    points: points(t, `landing.db.${key}.points`),
  };
}

function buildDbGroups(t: TFunction): DbGroup[] {
  return [
    {
      id: "identity",
      ...dbGroupCopy("identity", t),
      visual: <AuthTables />,
    },
    {
      id: "tenancy",
      ...dbGroupCopy("tenancy", t),
      visual: <TenantTables />,
    },
    {
      id: "billing",
      ...dbGroupCopy("billing", t),
      visual: <PlansCatalog />,
    },
    {
      id: "usage",
      ...dbGroupCopy("usage", t),
      visual: <UsageTables />,
    },
    {
      id: "articles",
      ...dbGroupCopy("articles", t),
      visual: <ArticleTables />,
    },
    {
      id: "platform",
      ...dbGroupCopy("platform", t),
      visual: <PlatformTables />,
    },
  ];
}

/**
 * The database pillar, told one domain at a time: an intro, then a subsection
 * per group (identity, tenancy, your resources) that explains its tables while
 * showing only those tables. Alternating sides keep it from feeling like a wall.
 */
export function DatabaseFoundation() {
  const { t, i18n } = useTranslation();
  const dbGroups = useMemo(() => buildDbGroups(t), [t, i18n.language]);

  return (
    <>
      <section className="border-t px-4 pt-16 pb-4 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
            <DatabaseIcon className="size-4" /> {t("landing.database.eyebrow")}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {t("landing.database.title")}
          </h3>
          <p className="mx-auto mt-3 text-pretty text-muted-foreground">
            {t("landing.database.bodyBefore")}
            <code className="font-mono text-xs">{t("landing.database.bodyCode")}</code>
            {t("landing.database.bodyAfter")}
          </p>
        </div>
      </section>

      {dbGroups.map((group, i) => (
        <DbGroupSection key={group.id} group={group} flip={i % 2 === 1} />
      ))}
    </>
  );
}

export function DbGroupSection({ group, flip }: { group: DbGroup; flip: boolean }) {
  return (
    <section className="px-4 py-8 sm:py-10">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className={`reveal min-w-0 ${flip ? "lg:order-2" : ""}`}>
          <p className="text-sm font-medium text-primary">{group.eyebrow}</p>
          <h4 className="mt-1.5 text-xl font-semibold tracking-tight text-balance sm:text-2xl">
            {group.title}
          </h4>
          <p className="mt-3 text-pretty text-muted-foreground">{group.body}</p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {group.points.map((point) => (
              <li key={point} className="flex gap-2.5">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`reveal reveal-delay min-w-0 ${flip ? "lg:order-1" : ""}`}>
          {group.visual}
        </div>
      </div>
    </section>
  );
}
