import { useTranslation } from "react-i18next";
import { ExplorerPreview } from "./explorer-preview";
import { buildRepoTree } from "./explorer-trees";

/** Foundations hero — full monorepo in the shared explorer chrome. */
export function MonorepoPreview({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <ExplorerPreview
      className={className}
      workspace={t("landing.foundationsIntro.preview.workspace")}
      ariaLabel={t("landing.foundationsIntro.preview.aria")}
      tree={buildRepoTree(t)}
    />
  );
}
