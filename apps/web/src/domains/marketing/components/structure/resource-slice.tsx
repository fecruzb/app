import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { FolderTreeIcon } from "lucide-react";
import { points } from "@/i18n";
import { CodeBlock } from "@app/ui/code-block";
import { MarketingHero } from "../marketing-hero";
import { TasksMock } from "../product-preview";
import { DbGroupSection } from "./database-foundation";
import {
  pageReadsFile,
  pageWritesFile,
  webApiFile,
  webRouteMapFile,
  webRoutesFile,
  webTreeFile,
} from "./resource-snippets";

// Web half of the example resource — API layers live under ApiStructure.
type Slice = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  /** The evidence for this step — a code panel, a mock, or both. */
  visual: ReactNode;
  /** Override FeatureSplit visual zoom for tall snippets. */
  visualScale?: number;
};

type SliceLocaleKey =
  | "webConvention"
  | "api"
  | "webRoutes"
  | "webRouteMap"
  | "page"
  | "pageWrites"
  | "screen";

function sliceCopy(localeKey: SliceLocaleKey, t: TFunction) {
  return {
    eyebrow: t(`landing.slices.${localeKey}.eyebrow`),
    title: t(`landing.slices.${localeKey}.title`),
    body: t(`landing.slices.${localeKey}.body`),
    points: points(t, `landing.slices.${localeKey}.points`),
  };
}

function buildResourceSlices(t: TFunction): Slice[] {
  return [
    {
      id: "web-convention",
      ...sliceCopy("webConvention", t),
      visual: <CodeBlock filename="apps/web/src/domains/task/" code={webTreeFile} lang="text" />,
    },
    {
      id: "api",
      ...sliceCopy("api", t),
      visual: <CodeBlock filename="apps/web/src/domains/task/api.ts" code={webApiFile} lang="ts" />,
    },
    {
      id: "web-routes",
      ...sliceCopy("webRoutes", t),
      visual: (
        <CodeBlock filename="apps/web/src/domains/task/routes.tsx" code={webRoutesFile} lang="ts" />
      ),
    },
    {
      id: "web-route-map",
      ...sliceCopy("webRouteMap", t),
      visual: (
        <CodeBlock
          filename="apps/web/src/domains/tenant/routes.tsx"
          code={webRouteMapFile}
          lang="ts"
        />
      ),
    },
    {
      id: "page",
      ...sliceCopy("page", t),
      visual: (
        <CodeBlock
          filename="apps/web/src/domains/task/pages/TasksPage.tsx"
          code={pageReadsFile}
          lang="ts"
        />
      ),
    },
    {
      id: "page-writes",
      ...sliceCopy("pageWrites", t),
      visual: (
        <CodeBlock
          filename="apps/web/src/domains/task/pages/TasksPage.tsx"
          code={pageWritesFile}
          lang="ts"
        />
      ),
    },
    {
      id: "screen",
      ...sliceCopy("screen", t),
      visual: <TasksMock />,
    },
  ];
}

/**
 * Web half of the example resource — after ApiStructure covered the server layers.
 */
export function ResourceSlice() {
  const { t, i18n } = useTranslation();
  const resourceSlices = useMemo(() => buildResourceSlices(t), [t, i18n.language]);

  return (
    <>
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <FolderTreeIcon className="size-4" />
            {t("landing.resourceIntro.eyebrow")}
          </>
        }
        title={t("landing.resourceIntro.title")}
        body={
          <>
            {t("landing.resourceIntro.bodyBefore")}
            <code className="font-mono text-xs">{t("landing.resourceIntro.bodyCode")}</code>
            {t("landing.resourceIntro.bodyAfter")}
          </>
        }
      />

      {resourceSlices.map((slice, i) => (
        <DbGroupSection
          key={slice.id}
          group={{
            id: slice.id,
            eyebrow: slice.eyebrow,
            title: slice.title,
            body: slice.body,
            points: slice.points,
            visual: slice.visual,
            visualScale: slice.visualScale,
          }}
          flip={i % 2 === 1}
        />
      ))}
    </>
  );
}
