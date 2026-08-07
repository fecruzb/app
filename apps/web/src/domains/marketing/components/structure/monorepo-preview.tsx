import { useTranslation } from "react-i18next";
import { Explorer } from "@app/ui/explorer";
import { buildRepoTree } from "./explorer-trees";

/** Full monorepo tree in the shared explorer chrome. */
export function MonorepoPreview({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Explorer
      className={className}
      title={t("landing.structureIntro.preview.explorer")}
      workspace={t("landing.structureIntro.preview.workspace")}
      ariaLabel={t("landing.structureIntro.preview.aria")}
      tree={buildRepoTree(t)}
    />
  );
}
