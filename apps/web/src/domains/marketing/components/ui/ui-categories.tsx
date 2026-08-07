import type { ReactNode } from "react";
import { BrandNavSection } from "./brand-nav-section";
import { ChartsSection } from "./charts-section";
import { ControlsSection } from "./controls-section";
import { DataPageSection } from "./data-page-section";
import { FormFieldsSection } from "./form-fields-section";
import { OverlaysSection } from "./overlays-section";
import { ShellDemosSection } from "./shell-demos-section";
import { ThemingSection } from "./theming-section";

export const UI_CATEGORY_IDS = [
  "theming",
  "brand",
  "shells",
  "controls",
  "forms",
  "overlays",
  "data",
  "charts",
] as const;

export type UiCategoryId = (typeof UI_CATEGORY_IDS)[number];

export function isUiCategoryId(value: string): value is UiCategoryId {
  return (UI_CATEGORY_IDS as readonly string[]).includes(value);
}

/** Live catalog sections for each User Interface category page. */
export function renderUiCategory(category: UiCategoryId): ReactNode {
  switch (category) {
    case "theming":
      return <ThemingSection />;
    case "brand":
      return <BrandNavSection />;
    case "shells":
      return <ShellDemosSection />;
    case "controls":
      return <ControlsSection />;
    case "forms":
      return <FormFieldsSection />;
    case "overlays":
      return <OverlaysSection />;
    case "data":
      return <DataPageSection />;
    case "charts":
      return <ChartsSection />;
  }
}
