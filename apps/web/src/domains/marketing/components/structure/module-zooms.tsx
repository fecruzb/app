import type { TFunction } from "i18next";
import { FolderTreeIcon, PaletteIcon } from "lucide-react";
import { points } from "@/i18n";
import { Explorer } from "@app/ui/explorer";
import type { Foundation } from "../foundations/foundation-section";
import { buildUiTree } from "./explorer-trees";
import { MonorepoPreview } from "./monorepo-preview";

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

export function buildUiPillar(t: TFunction): Foundation {
  return {
    id: "ui",
    icon: PaletteIcon,
    eyebrow: t("landing.moduleZoom.ui.eyebrow"),
    title: t("landing.moduleZoom.ui.title"),
    body: t("landing.moduleZoom.ui.body"),
    points: points(t, "landing.moduleZoom.ui.points"),
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
