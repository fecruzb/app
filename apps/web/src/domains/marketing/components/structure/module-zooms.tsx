import type { TFunction } from "i18next";
import { FolderTreeIcon, LayoutIcon, PaletteIcon } from "lucide-react";
import { points } from "@/i18n";
import { Explorer } from "@app/ui/explorer";
import type { Foundation } from "../foundations/foundation-section";
import { buildUiTree, buildWebTree } from "./explorer-trees";
import { MonorepoPreview } from "./monorepo-preview";

function moduleCopy(key: "web" | "ui", t: TFunction) {
  return {
    eyebrow: t(`landing.moduleZoom.${key}.eyebrow`),
    title: t(`landing.moduleZoom.${key}.title`),
    body: t(`landing.moduleZoom.${key}.body`),
    points: points(t, `landing.moduleZoom.${key}.points`),
  };
}

/** Whole-repo overview — Structure hub narrative. */
export function buildMonorepoPillar(t: TFunction): Foundation {
  return {
    id: "monorepo",
    icon: FolderTreeIcon,
    eyebrow: t("landing.monorepo.eyebrow"),
    title: t("landing.monorepo.title"),
    body: t("landing.monorepo.body"),
    points: points(t, "landing.monorepo.points"),
    visual: <MonorepoPreview />,
  };
}

export function buildWebPillar(t: TFunction): Foundation {
  return {
    id: "web",
    icon: LayoutIcon,
    ...moduleCopy("web", t),
    visual: (
      <Explorer
        title={t("landing.structureIntro.preview.explorer")}
        workspace={t("landing.moduleZoom.web.workspace")}
        ariaLabel={t("landing.moduleZoom.web.aria")}
        tree={buildWebTree(t)}
      />
    ),
  };
}

export function buildUiPillar(t: TFunction): Foundation {
  return {
    id: "ui",
    icon: PaletteIcon,
    ...moduleCopy("ui", t),
    visual: (
      <Explorer
        title={t("landing.structureIntro.preview.explorer")}
        workspace={t("landing.moduleZoom.ui.workspace")}
        ariaLabel={t("landing.moduleZoom.ui.aria")}
        tree={buildUiTree(t)}
      />
    ),
  };
}
