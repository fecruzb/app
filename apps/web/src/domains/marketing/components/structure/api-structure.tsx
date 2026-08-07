import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ServerIcon } from "lucide-react";
import { points } from "@/i18n";
import { CodeBlock } from "@app/ui/code-block";
import { Explorer } from "@app/ui/explorer";
import { MarketingHero } from "../marketing-hero";
import { DbGroupSection } from "./database-foundation";
import { buildApiTree } from "./explorer-trees";
import {
  dtoFile,
  repositoryMethodFile,
  repositoryOutlineFile,
  routeHandlerFile,
  routeMapFile,
  schemaFile,
  toolFile,
  toolMapFile,
} from "./resource-snippets";

type ApiLayer = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  visual: ReactNode;
  visualScale?: number;
};

type LayerKey =
  | "schemaFile"
  | "repository"
  | "repositoryMethod"
  | "tool"
  | "toolMap"
  | "dto"
  | "route"
  | "routeMap";

function layerCopy(key: LayerKey, t: TFunction) {
  return {
    eyebrow: t(`landing.slices.${key}.eyebrow`),
    title: t(`landing.slices.${key}.title`),
    body: t(`landing.slices.${key}.body`),
    points: points(t, `landing.slices.${key}.points`),
  };
}

/** Folder overview — explorer in a side card (like Database groups). */
function buildApiOverview(t: TFunction): ApiLayer {
  return {
    id: "overview",
    eyebrow: t("landing.moduleZoom.api.layout.eyebrow"),
    title: t("landing.moduleZoom.api.layout.title"),
    body: t("landing.moduleZoom.api.layout.body"),
    points: points(t, "landing.moduleZoom.api.points"),
    visual: (
      <Explorer
        title={t("landing.structureIntro.preview.explorer")}
        workspace={t("landing.moduleZoom.api.workspace")}
        ariaLabel={t("landing.moduleZoom.api.aria")}
        tree={buildApiTree(t)}
      />
    ),
  };
}

/**
 * API domain layers in build order — each card shows a CodeBlock, not the explorer.
 * Overview → schema → method → repository → tool → tool map → DTOs → route → route map.
 */
function buildApiLayers(t: TFunction): ApiLayer[] {
  return [
    buildApiOverview(t),
    {
      id: "schema",
      ...layerCopy("schemaFile", t),
      visualScale: 0.72,
      visual: (
        <CodeBlock filename="domains/task/schema/tasks.schema.ts" code={schemaFile} lang="ts" />
      ),
    },
    {
      id: "repository-method",
      ...layerCopy("repositoryMethod", t),
      visualScale: 0.72,
      visual: (
        <CodeBlock
          filename="domains/task/repository.ts → list"
          code={repositoryMethodFile}
          lang="ts"
        />
      ),
    },
    {
      id: "repository",
      ...layerCopy("repository", t),
      visual: (
        <CodeBlock filename="domains/task/repository.ts" code={repositoryOutlineFile} lang="ts" />
      ),
    },
    {
      id: "tool",
      ...layerCopy("tool", t),
      visualScale: 0.7,
      visual: (
        <CodeBlock filename="domains/task/tools/create-task.tool.ts" code={toolFile} lang="ts" />
      ),
    },
    {
      id: "tool-map",
      ...layerCopy("toolMap", t),
      visual: <CodeBlock filename="domains/task/tools/index.ts" code={toolMapFile} lang="ts" />,
    },
    {
      id: "dto",
      ...layerCopy("dto", t),
      visual: <CodeBlock filename="domains/task/dto.ts" code={dtoFile} lang="ts" />,
    },
    {
      id: "route",
      ...layerCopy("route", t),
      visualScale: 0.7,
      visual: (
        <CodeBlock
          filename="domains/task/routes/task.post.route.ts"
          code={routeHandlerFile}
          lang="ts"
        />
      ),
    },
    {
      id: "route-map",
      ...layerCopy("routeMap", t),
      visual: <CodeBlock filename="domains/task/routes/index.ts" code={routeMapFile} lang="ts" />,
    },
  ];
}

/** apps/api — compact intro + fluid splits (explorer, then code layers). */
export function ApiStructure() {
  const { t, i18n } = useTranslation();
  const layers = useMemo(() => buildApiLayers(t), [t, i18n.language]);

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

      {layers.map((layer, i) => (
        <DbGroupSection
          key={layer.id}
          group={{
            id: layer.id,
            eyebrow: layer.eyebrow,
            title: layer.title,
            body: layer.body,
            points: layer.points,
            visual: layer.visual,
            visualScale: layer.visualScale,
          }}
          flip={i % 2 === 1}
        />
      ))}
    </>
  );
}
