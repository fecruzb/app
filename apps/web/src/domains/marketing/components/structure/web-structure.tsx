import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { LayoutIcon } from "lucide-react";
import { points } from "@/i18n";
import { Explorer } from "@app/ui/explorer";
import type { ExplorerNode } from "@app/ui/explorer";
import { MarketingHero } from "../marketing-hero";
import { DbGroupSection } from "./database-foundation";
import { ExplorerCodeCarousel, type CodeExample } from "./explorer-code-carousel";
import { buildWebFolderTree, buildWebTree } from "./explorer-trees";
import {
  pageReadsFile,
  pageWritesFile,
  webApiFile,
  webApiMethodFile,
  webAppMountFile,
  webBrandFile,
  webComponentFile,
  webConstantsSnippet,
  webContextFile,
  webHooksFile,
  webI18nFile,
  webLayoutsFile,
  webLibApiFile,
  webRouteMapFile,
  webRoutesFile,
  webThemeFile,
  webUtilsSnippet,
} from "./resource-snippets";

type FolderKey =
  | "domains"
  | "app"
  | "layouts"
  | "lib"
  | "i18n"
  | "theme"
  | "brand"
  | "api"
  | "pages"
  | "routes"
  | "components"
  | "context"
  | "hooks"
  | "constants"
  | "utils";

type WebLayer = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  visual: ReactNode;
};

/** One unit (code) + optional index/map of all units — same aggregator pattern. */
const folderExamples: Partial<Record<FolderKey, CodeExample[]>> = {
  app: [{ mode: "code", filename: "app/App.tsx", code: webAppMountFile }],
  layouts: [{ mode: "code", filename: "layouts/RequireAuth.tsx", code: webLayoutsFile }],
  lib: [{ mode: "code", filename: "lib/api.ts", code: webLibApiFile }],
  i18n: [{ mode: "code", filename: "i18n/", code: webI18nFile }],
  theme: [{ mode: "code", filename: "theme/theme-controls.tsx", code: webThemeFile }],
  brand: [{ mode: "code", filename: "brand/logo.tsx", code: webBrandFile }],
  // Zoom-in: Files → all methods → one call
  api: [
    { mode: "index", filename: "domains/task/api.ts", code: webApiFile },
    { mode: "code", filename: "domains/task/api.ts → list", code: webApiMethodFile },
  ],
  // Zoom-in: Files → reads/chrome → writes
  pages: [
    { mode: "index", filename: "domains/task/pages/TasksPage.tsx", code: pageReadsFile },
    {
      mode: "code",
      filename: "domains/task/pages/TasksPage.tsx → writes",
      code: pageWritesFile,
    },
  ],
  // Zoom-in: Files → tenant compose → one domain Route
  routes: [
    { mode: "index", filename: "domains/tenant/routes.tsx", code: webRouteMapFile },
    { mode: "code", filename: "domains/task/routes.tsx", code: webRoutesFile },
  ],
  components: [
    {
      mode: "code",
      filename: "domains/tenant/components/role-select.tsx",
      code: webComponentFile,
    },
  ],
  context: [
    {
      mode: "code",
      filename: "domains/tenant/context/tenant-provider.tsx",
      code: webContextFile,
    },
  ],
  hooks: [
    {
      mode: "code",
      filename: "domains/agent/hooks/use-audio-recorder.ts",
      code: webHooksFile,
    },
  ],
  constants: [
    {
      mode: "code",
      filename: "domains/<domain>/constants/<topic>.constants.ts",
      code: webConstantsSnippet,
    },
  ],
  utils: [
    {
      mode: "code",
      filename: "domains/<domain>/utils/<topic>.utils.ts",
      code: webUtilsSnippet,
    },
  ],
};

function webExplorer(t: TFunction, workspace: string, tree: ExplorerNode[]) {
  return (
    <Explorer
      title={t("landing.structureIntro.preview.explorer")}
      workspace={workspace}
      ariaLabel={t("landing.moduleZoom.web.aria")}
      tree={tree}
    />
  );
}

function folderVisual(key: FolderKey, t: TFunction): ReactNode {
  const { workspace, tree } = buildWebFolderTree(key, t);
  const explorer = webExplorer(t, workspace, tree);
  const examples = folderExamples[key];
  if (!examples?.length) return explorer;
  return (
    <ExplorerCodeCarousel tree={explorer} examples={examples} labelsNamespace="landing.webCourse" />
  );
}

function folderBlock(key: FolderKey, t: TFunction): WebLayer {
  return {
    id: key,
    eyebrow: t(`landing.webCourse.folders.${key}.eyebrow`),
    title: t(`landing.webCourse.folders.${key}.title`),
    body: t(`landing.webCourse.folders.${key}.body`),
    points: points(t, `landing.webCourse.folders.${key}.points`),
    visual: folderVisual(key, t),
  };
}

function buildOverview(t: TFunction): WebLayer {
  return {
    id: "overview",
    eyebrow: t("landing.moduleZoom.web.layout.eyebrow"),
    title: t("landing.moduleZoom.web.layout.title"),
    body: t("landing.moduleZoom.web.layout.body"),
    points: points(t, "landing.moduleZoom.web.points"),
    visual: webExplorer(t, t("landing.moduleZoom.web.workspace"), buildWebTree(t)),
  };
}

/** Overview → src folders → domain folders. One block each. */
function buildChapters(t: TFunction): { part?: string; layers: WebLayer[] }[] {
  return [
    {
      layers: [
        buildOverview(t),
        folderBlock("domains", t),
        folderBlock("app", t),
        folderBlock("layouts", t),
        folderBlock("lib", t),
        folderBlock("i18n", t),
        folderBlock("theme", t),
        folderBlock("brand", t),
      ],
    },
    {
      part: "domain",
      layers: [
        folderBlock("api", t),
        folderBlock("pages", t),
        folderBlock("routes", t),
        folderBlock("components", t),
        folderBlock("context", t),
        folderBlock("hooks", t),
        folderBlock("constants", t),
        folderBlock("utils", t),
      ],
    },
  ];
}

/** Frontend SPA structure — one folder block at a time. */
export function WebStructure() {
  const { t, i18n } = useTranslation();
  const chapters = useMemo(() => buildChapters(t), [t, i18n.language]);

  let flipIndex = 0;

  return (
    <>
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <LayoutIcon className="size-4" />
            {t("landing.moduleZoom.web.eyebrow")}
          </>
        }
        title={t("landing.moduleZoom.web.title")}
        body={t("landing.moduleZoom.web.body")}
      />

      {chapters.map((chapter) => (
        <div key={chapter.part ?? "src"}>
          {chapter.part ? (
            <MarketingHero
              headingAs="h2"
              eyebrow={t(`landing.webCourse.parts.${chapter.part}.eyebrow`)}
              title={t(`landing.webCourse.parts.${chapter.part}.title`)}
              body={t(`landing.webCourse.parts.${chapter.part}.body`)}
            />
          ) : null}

          {chapter.layers.map((layer) => {
            const flip = flipIndex % 2 === 1;
            flipIndex += 1;
            return (
              <DbGroupSection
                key={layer.id}
                group={{
                  id: layer.id,
                  eyebrow: layer.eyebrow,
                  title: layer.title,
                  body: layer.body,
                  points: layer.points,
                  visual: layer.visual,
                }}
                flip={flip}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}
