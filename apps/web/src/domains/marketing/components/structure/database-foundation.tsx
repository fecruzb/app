import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { DatabaseIcon } from "lucide-react";
import { points } from "@/i18n";
import { FeatureSplit } from "../feature-split";
import { MarketingHero } from "../marketing-hero";
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
  /** Override FeatureSplit visual zoom for tall snippets. */
  visualScale?: number;
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
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <DatabaseIcon className="size-4" />
            {t("landing.database.eyebrow")}
          </>
        }
        title={t("landing.database.title")}
        body={
          <>
            {t("landing.database.bodyBefore")}
            <code className="font-mono text-xs">{t("landing.database.bodyCode")}</code>
            {t("landing.database.bodyAfter")}
          </>
        }
      />

      {dbGroups.map((group, i) => (
        <DbGroupSection key={group.id} group={group} flip={i % 2 === 1} />
      ))}
    </>
  );
}

export function DbGroupSection({ group, flip }: { group: DbGroup; flip: boolean }) {
  return (
    <FeatureSplit
      density="tight"
      headingAs="h4"
      flip={flip}
      eyebrow={group.eyebrow}
      title={group.title}
      body={group.body}
      points={group.points}
      visual={group.visual}
      visualScale={group.visualScale}
    />
  );
}
