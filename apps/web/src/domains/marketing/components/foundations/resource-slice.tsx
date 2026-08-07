import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { FolderTreeIcon } from "lucide-react";
import { points } from "@/i18n";
import { CodeBlock } from "@app/ui/code-block";
import { MarketingHero } from "../marketing-hero";
import { TaskTable, TasksMock } from "../product-preview";
import { DbGroupSection } from "./database-foundation";
import {
  domainMapFile,
  pageReadsFile,
  pageWritesFile,
  repositoryMethodFile,
  repositoryOutlineFile,
  routeHandlerFile,
  routeMapFile,
  schemaFile,
  toolFile,
  toolMapFile,
  webApiFile,
  webRouteMapFile,
  webRoutesFile,
  webTreeFile,
} from "./resource-snippets";

// A single resource, walked top to bottom using the repo's real task domain:
// its folder, the SQL + route, the agent tool, and the screen it powers.
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
  | "convention"
  | "schema"
  | "schemaFile"
  | "repository"
  | "repositoryMethod"
  | "route"
  | "routeMap"
  | "tool"
  | "toolMap"
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

// One visual per step: domain map → API files → web files → the screen.
// tasks is the placeholder resource you'd copy end to end for your own.
function buildResourceSlices(t: TFunction): Slice[] {
  return [
    {
      id: "convention",
      ...sliceCopy("convention", t),
      visual: <CodeBlock filename="domains/task/" code={domainMapFile} lang="text" />,
    },
    {
      id: "schema",
      ...sliceCopy("schema", t),
      visual: <TaskTable />,
    },
    {
      id: "schema-file",
      ...sliceCopy("schemaFile", t),
      visual: <CodeBlock filename="domains/task/schema.ts" code={schemaFile} lang="ts" />,
    },
    {
      id: "repository",
      ...sliceCopy("repository", t),
      visual: (
        <CodeBlock filename="domains/task/repository.ts" code={repositoryOutlineFile} lang="ts" />
      ),
    },
    {
      id: "repository-method",
      ...sliceCopy("repositoryMethod", t),
      visual: (
        <CodeBlock
          filename="domains/task/repository.ts → list"
          code={repositoryMethodFile}
          lang="ts"
        />
      ),
    },
    {
      id: "route",
      ...sliceCopy("route", t),
      visualScale: 0.7,
      visual: (
        <CodeBlock
          filename="domains/task/routes/create-task.route.ts"
          code={routeHandlerFile}
          lang="ts"
        />
      ),
    },
    {
      id: "route-map",
      ...sliceCopy("routeMap", t),
      visual: <CodeBlock filename="domains/task/routes/index.ts" code={routeMapFile} lang="ts" />,
    },
    {
      id: "tool",
      ...sliceCopy("tool", t),
      // Tall defineTool file — zoom down further than the tight default.
      visualScale: 0.7,
      visual: (
        <CodeBlock filename="domains/task/tools/create-task.tool.ts" code={toolFile} lang="ts" />
      ),
    },
    {
      id: "tool-map",
      ...sliceCopy("toolMap", t),
      visual: <CodeBlock filename="domains/task/tools/index.ts" code={toolMapFile} lang="ts" />,
    },
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
 * The example resource walked end to end: the table opened it in the database
 * section, and this closes the loop — repository + route, the agent tool,
 * and the screen — all from the repo's real task domain, alternating sides.
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
