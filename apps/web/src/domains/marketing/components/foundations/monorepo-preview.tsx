import { useTranslation } from "react-i18next";
import { Explorer } from "@app/ui/explorer";
import { buildRepoTree } from "./explorer-trees";

/** Foundations hero — full monorepo in the shared explorer chrome. */
export function MonorepoPreview({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Explorer
      className={className}
      workspace={t("landing.foundationsIntro.preview.workspace")}
      ariaLabel={t("landing.foundationsIntro.preview.aria")}
      tree={buildRepoTree(t)}
    />
  );
}
