import { useTheme } from "@app/ui/theme";
import { useTranslation } from "react-i18next";
import { MoonIcon, PaletteIcon, SunIcon } from "lucide-react";
import { CodeBlock } from "@app/ui/code-block";

const themeFile = `// Brand pack on top of @app/ui — optional when you diverge
import { createTheme, defaultThemes } from "@app/ui/theme";

export const appThemes = [
  ...defaultThemes,
  createTheme({
    id: "violet",
    primary: "oklch(0.55 0.22 295)",
    primaryDark: "oklch(0.68 0.19 295)",
  }),
];

// main.tsx
// <ThemeProvider themes={appThemes} />`;

/**
 * Live theming demo — the swatches and toggle drive the real ThemeProvider, so
 * clicking one recolors this entire page. The code panel shows how to extend
 * the kit catalog with createTheme.
 */
export function ThemingSection() {
  const { t } = useTranslation();
  const { themes, themeId, setTheme, mode, setMode } = useTheme();

  return (
    <section className="border-t px-4 py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="reveal">
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <PaletteIcon className="size-4" /> {t("landing.theming.eyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {t("landing.theming.title")}
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            {t("landing.theming.bodyBefore")}
            <code className="font-mono text-xs">{t("landing.theming.bodyCode")}</code>
            {t("landing.theming.bodyAfter")}
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {t("landing.theming.primaryColor")}
              </p>
              <div className="flex flex-wrap gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setTheme(theme.id)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      theme.id === themeId
                        ? "border-primary bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <span
                      className="size-3.5 rounded-full border"
                      style={{ backgroundColor: theme.swatch }}
                    />
                    {t(`theme.themes.${theme.id}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {t("landing.theming.mode")}
              </p>
              <div className="inline-flex rounded-lg border p-1">
                <button
                  onClick={() => setMode("light")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    mode === "light"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <SunIcon className="size-4" /> {t("landing.theming.light")}
                </button>
                <button
                  onClick={() => setMode("dark")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    mode === "dark" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  <MoonIcon className="size-4" /> {t("landing.theming.dark")}
                </button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{t("landing.theming.tryIt")}</p>
          </div>
        </div>

        <div className="reveal reveal-delay min-w-0">
          <CodeBlock filename="src/theme/app-themes.ts" code={themeFile} lang="ts" />
        </div>
      </div>
    </section>
  );
}
