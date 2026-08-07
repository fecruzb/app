import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ServerIcon } from "lucide-react";
import { points } from "@/i18n";
import { Explorer } from "@app/ui/explorer";
import type { ExplorerNode } from "@app/ui/explorer";
import { MarketingHero } from "../marketing-hero";
import { DbGroupSection } from "./database-foundation";
import { ExplorerCodeCarousel, type CodeExample } from "./explorer-code-carousel";
import { buildApiFolderTree, buildApiTree } from "./explorer-trees";
import {
  agentRegistryFile,
  appMountFile,
  constantsFile,
  dbSchemaBarrelFile,
  dtoFile,
  middlewareFile,
  repositoryMethodFile,
  repositoryOutlineFile,
  routeHandlerFile,
  routeMapFile,
  schemaFile,
  serviceFile,
  templateFile,
  toolFile,
  toolMapFile,
  utilsFile,
} from "./resource-snippets";

type FolderKey =
  | "domains"
  | "lib"
  | "integrations"
  | "db"
  | "agent"
  | "app"
  | "schema"
  | "repository"
  | "dto"
  | "routes"
  | "tools"
  | "service"
  | "middleware"
  | "constants"
  | "utils"
  | "template";

type ApiLayer = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  visual: ReactNode;
};

/** One unit (code) + optional index/map of all units — same aggregator pattern. */
const folderExamples: Partial<Record<FolderKey, CodeExample[]>> = {
  db: [{ mode: "code", filename: "db/schema.ts", code: dbSchemaBarrelFile }],
  agent: [{ mode: "code", filename: "agent/registry.ts", code: agentRegistryFile }],
  app: [{ mode: "code", filename: "app.ts", code: appMountFile }],
  schema: [{ mode: "code", filename: "domains/task/schema/tasks.schema.ts", code: schemaFile }],
  // Zoom-in: Files → file (all methods) → one function
  repository: [
    { mode: "index", filename: "domains/task/repository.ts", code: repositoryOutlineFile },
    { mode: "code", filename: "domains/task/repository.ts → list", code: repositoryMethodFile },
  ],
  dto: [{ mode: "code", filename: "domains/task/dto.ts", code: dtoFile }],
  // Zoom-in: Files → route map → one handler
  routes: [
    { mode: "index", filename: "domains/task/routes/index.ts", code: routeMapFile },
    {
      mode: "code",
      filename: "domains/task/routes/task.post.route.ts",
      code: routeHandlerFile,
    },
  ],
  // Zoom-in: Files → tool map → one tool
  tools: [
    { mode: "index", filename: "domains/task/tools/index.ts", code: toolMapFile },
    { mode: "code", filename: "domains/task/tools/create-task.tool.ts", code: toolFile },
  ],
  service: [{ mode: "code", filename: "domains/auth/service.ts", code: serviceFile }],
  middleware: [
    {
      mode: "code",
      filename: "domains/auth/middleware/require-auth.middleware.ts",
      code: middlewareFile,
    },
  ],
  constants: [
    { mode: "code", filename: "domains/billing/constants/plans.constants.ts", code: constantsFile },
  ],
  utils: [{ mode: "code", filename: "domains/tenant/utils/slug.utils.ts", code: utilsFile }],
  template: [
    {
      mode: "code",
      filename: "domains/auth/template/verify-email.template.ts",
      code: templateFile,
    },
  ],
};

function apiExplorer(t: TFunction, workspace: string, tree: ExplorerNode[]) {
  return (
    <Explorer
      title={t("landing.structureIntro.preview.explorer")}
      workspace={workspace}
      ariaLabel={t("landing.moduleZoom.api.aria")}
      tree={tree}
    />
  );
}

function folderVisual(key: FolderKey, t: TFunction): ReactNode {
  const { workspace, tree } = buildApiFolderTree(key, t);
  const explorer = apiExplorer(t, workspace, tree);
  const examples = folderExamples[key];
  if (!examples?.length) return explorer;
  return <ExplorerCodeCarousel tree={explorer} examples={examples} />;
}

function folderBlock(key: FolderKey, t: TFunction): ApiLayer {
  return {
    id: key,
    eyebrow: t(`landing.apiCourse.folders.${key}.eyebrow`),
    title: t(`landing.apiCourse.folders.${key}.title`),
    body: t(`landing.apiCourse.folders.${key}.body`),
    points: points(t, `landing.apiCourse.folders.${key}.points`),
    visual: folderVisual(key, t),
  };
}

function buildOverview(t: TFunction): ApiLayer {
  return {
    id: "overview",
    eyebrow: t("landing.moduleZoom.api.layout.eyebrow"),
    title: t("landing.moduleZoom.api.layout.title"),
    body: t("landing.moduleZoom.api.layout.body"),
    points: points(t, "landing.moduleZoom.api.points"),
    visual: apiExplorer(t, t("landing.moduleZoom.api.workspace"), buildApiTree(t)),
  };
}

/** Overview → src folders → domain folders. One block each. */
function buildChapters(t: TFunction): { part?: string; layers: ApiLayer[] }[] {
  return [
    {
      layers: [
        buildOverview(t),
        folderBlock("domains", t),
        folderBlock("lib", t),
        folderBlock("integrations", t),
        folderBlock("db", t),
        folderBlock("agent", t),
        folderBlock("app", t),
      ],
    },
    {
      part: "domain",
      layers: [
        folderBlock("schema", t),
        folderBlock("repository", t),
        folderBlock("dto", t),
        folderBlock("routes", t),
        folderBlock("tools", t),
        folderBlock("service", t),
        folderBlock("middleware", t),
        folderBlock("constants", t),
        folderBlock("utils", t),
        folderBlock("template", t),
      ],
    },
  ];
}

/** Backend API structure — one folder block at a time. */
export function ApiStructure() {
  const { t, i18n } = useTranslation();
  const chapters = useMemo(() => buildChapters(t), [t, i18n.language]);

  let flipIndex = 0;

  return (
    <>
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <ServerIcon className="size-4" />
            {t("landing.moduleZoom.api.eyebrow")}
          </>
        }
        title={t("landing.moduleZoom.api.title")}
        body={t("landing.moduleZoom.api.body")}
      />

      {chapters.map((chapter) => (
        <div key={chapter.part ?? "src"}>
          {chapter.part ? (
            <MarketingHero
              headingAs="h2"
              eyebrow={t(`landing.apiCourse.parts.${chapter.part}.eyebrow`)}
              title={t(`landing.apiCourse.parts.${chapter.part}.title`)}
              body={t(`landing.apiCourse.parts.${chapter.part}.body`)}
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
