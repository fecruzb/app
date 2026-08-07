import { darkBase, lightBase, type Theme, type ThemeTokens } from "./themes";

export type CreateThemeOptions = {
  id: string;
  /** Light-mode primary (also used as the picker swatch unless `swatch` is set). */
  primary: string;
  /** Dark-mode primary; defaults to `primary`. */
  primaryDark?: string;
  /** Contrasting text on the light primary. */
  primaryForeground?: string;
  /** Contrasting text on the dark primary. */
  primaryForegroundDark?: string;
  swatch?: string;
  /** Extra / override tokens merged into the light set. */
  light?: ThemeTokens;
  /** Extra / override tokens merged into the dark set. */
  dark?: ThemeTokens;
};

/**
 * Build a full light+dark theme from a brand primary.
 * Surfaces come from `lightBase` / `darkBase`; only the accent needs to change.
 */
export function createTheme({
  id,
  primary,
  primaryDark = primary,
  primaryForeground = "oklch(0.985 0 0)",
  primaryForegroundDark = "oklch(0.145 0 0)",
  swatch = primary,
  light,
  dark,
}: CreateThemeOptions): Theme {
  return {
    id,
    swatch,
    light: {
      ...lightBase,
      "--primary": primary,
      "--primary-foreground": primaryForeground,
      "--ring": primary,
      ...light,
    },
    dark: {
      ...darkBase,
      "--primary": primaryDark,
      "--primary-foreground": primaryForegroundDark,
      "--ring": primaryDark,
      ...dark,
    },
  };
}
