/**
 * The whole theming system lives here. A theme is just two sets of tokens —
 * one for `light`, one for `dark` — expressed as the same CSS variables the UI
 * already consumes (`--primary`, `--background`, …). `ThemeProvider` writes the
 * chosen set onto `<html>` at runtime, so every `bg-primary` / `text-foreground`
 * class re-colors itself with no component changes.
 *
 * To add your own theme: copy one block below, pick a new `id`, and swap the
 * `--primary` (and its foreground) for your brand color. Colors are oklch —
 * `oklch(lightness chroma hue)` — but any valid CSS color works.
 */

export type ThemeTokens = Record<string, string>;

export type Theme = {
  id: string;
  /** Swatch shown in the picker — usually the light primary. */
  swatch: string;
  light: ThemeTokens;
  dark: ThemeTokens;
};

// Tokens shared by every theme's light mode — only the accent color changes per
// theme, so the neutral surfaces are declared once and spread in.
const lightBase: ThemeTokens = {
  "--background": "oklch(1 0 0)",
  "--foreground": "oklch(0.145 0 0)",
  "--card": "oklch(1 0 0)",
  "--card-foreground": "oklch(0.145 0 0)",
  "--popover": "oklch(1 0 0)",
  "--popover-foreground": "oklch(0.145 0 0)",
  "--secondary": "oklch(0.97 0 0)",
  "--secondary-foreground": "oklch(0.205 0 0)",
  "--muted": "oklch(0.97 0 0)",
  "--muted-foreground": "oklch(0.556 0 0)",
  "--accent": "oklch(0.97 0 0)",
  "--accent-foreground": "oklch(0.205 0 0)",
  "--destructive": "oklch(0.577 0.245 27.325)",
  "--destructive-foreground": "oklch(0.985 0 0)",
  "--border": "oklch(0.922 0 0)",
  "--input": "oklch(0.922 0 0)",
};

const darkBase: ThemeTokens = {
  "--background": "oklch(0.145 0 0)",
  "--foreground": "oklch(0.985 0 0)",
  "--card": "oklch(0.205 0 0)",
  "--card-foreground": "oklch(0.985 0 0)",
  "--popover": "oklch(0.205 0 0)",
  "--popover-foreground": "oklch(0.985 0 0)",
  "--secondary": "oklch(0.269 0 0)",
  "--secondary-foreground": "oklch(0.985 0 0)",
  "--muted": "oklch(0.269 0 0)",
  "--muted-foreground": "oklch(0.708 0 0)",
  "--accent": "oklch(0.269 0 0)",
  "--accent-foreground": "oklch(0.985 0 0)",
  "--destructive": "oklch(0.704 0.191 22.216)",
  "--destructive-foreground": "oklch(0.985 0 0)",
  "--border": "oklch(1 0 0 / 10%)",
  "--input": "oklch(1 0 0 / 15%)",
};

export const themes: Theme[] = [
  {
    id: "mono",
    swatch: "oklch(0.205 0 0)",
    light: {
      ...lightBase,
      "--primary": "oklch(0.205 0 0)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.708 0 0)",
    },
    dark: {
      ...darkBase,
      "--primary": "oklch(0.985 0 0)",
      "--primary-foreground": "oklch(0.205 0 0)",
      "--ring": "oklch(0.556 0 0)",
    },
  },
  {
    id: "blue",
    swatch: "oklch(0.55 0.2 255)",
    light: {
      ...lightBase,
      "--primary": "oklch(0.55 0.2 255)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.55 0.2 255)",
    },
    dark: {
      ...darkBase,
      "--primary": "oklch(0.65 0.19 255)",
      "--primary-foreground": "oklch(0.145 0 0)",
      "--ring": "oklch(0.65 0.19 255)",
    },
  },
  {
    id: "violet",
    swatch: "oklch(0.55 0.22 295)",
    light: {
      ...lightBase,
      "--primary": "oklch(0.55 0.22 295)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.55 0.22 295)",
    },
    dark: {
      ...darkBase,
      "--primary": "oklch(0.68 0.19 295)",
      "--primary-foreground": "oklch(0.145 0 0)",
      "--ring": "oklch(0.68 0.19 295)",
    },
  },
  {
    id: "emerald",
    swatch: "oklch(0.6 0.14 163)",
    light: {
      ...lightBase,
      "--primary": "oklch(0.6 0.14 163)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.6 0.14 163)",
    },
    dark: {
      ...darkBase,
      "--primary": "oklch(0.7 0.15 163)",
      "--primary-foreground": "oklch(0.145 0 0)",
      "--ring": "oklch(0.7 0.15 163)",
    },
  },
];

export type Mode = "light" | "dark";

export const DEFAULT_THEME = "mono";
export const DEFAULT_MODE: Mode = "light";

export function getTheme(id: string): Theme {
  return themes.find((t) => t.id === id) ?? themes[0];
}
