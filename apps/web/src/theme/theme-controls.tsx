import { useState } from "react";
import {
  CheckIcon,
  LanguagesIcon,
  MoonIcon,
  PaletteIcon,
  SunIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@app/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@app/ui/dropdown-menu";
import { cn } from "@app/ui/lib/utils";
import { LocalePicker, setLocale } from "@/i18n/locale-controls";
import { LOCALES, type Locale } from "@/i18n";
import { useTheme } from "./theme-provider";

/** Icon button that flips between light and dark. */
export function ModeToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { mode, toggleMode } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMode}
      aria-label={mode === "dark" ? t("theme.switchToLight") : t("theme.switchToDark")}
      className={className}
    >
      {mode === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}

/** Dropdown that swaps the active color theme (primary palette). */
export function ThemePicker({
  className,
  side = "bottom",
}: {
  className?: string;
  side?: "top" | "bottom";
}) {
  const { t } = useTranslation();
  const { themes, themeId, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("theme.changeTheme")}
          className={className}
        >
          <PaletteIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side={side} avoidCollisions={false} className="w-44">
        <DropdownMenuLabel>{t("theme.themeColor")}</DropdownMenuLabel>
        {themes.map((theme) => (
          <DropdownMenuItem key={theme.id} onSelect={() => setTheme(theme.id)}>
            <span
              className="size-4 rounded-full border"
              style={{ backgroundColor: theme.swatch }}
            />
            <span className="flex-1">{theme.label}</span>
            {theme.id === themeId && <CheckIcon />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type MenuSide = "top" | "bottom";

/**
 * Language, theme and mode.
 *
 * `menuAlign="bar"` positions both menus on the horizontal center of this
 * control row (sidebar footer). `menuAlign="trigger"` centers on each button
 * (landing header).
 */
export function ThemeControls({
  className,
  menuSide = "bottom",
  menuAlign = "trigger",
}: {
  className?: string;
  menuSide?: MenuSide;
  menuAlign?: "trigger" | "bar";
}) {
  if (menuAlign === "bar") {
    return <BarThemeControls className={className} menuSide={menuSide} />;
  }

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <LocalePicker side={menuSide} />
      <ThemePicker side={menuSide} />
      <ModeToggle />
    </div>
  );
}

/** Sidebar footer: menus open centered on the full control row. */
function BarThemeControls({
  className,
  menuSide,
}: {
  className?: string;
  menuSide: MenuSide;
}) {
  const { t, i18n: i18nInstance } = useTranslation();
  const { themes, themeId, setTheme } = useTheme();
  const [localeOpen, setLocaleOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const current = (
    LOCALES.includes(i18nInstance.language as Locale)
      ? i18nInstance.language
      : i18nInstance.language.startsWith("pt")
        ? "pt"
        : "en"
  ) as Locale;

  return (
    <div className={cn("relative w-full", className)}>
      {/* Full-width anchors so menus center on the navbar, not each icon. */}
      <DropdownMenu
        open={localeOpen}
        onOpenChange={(open) => {
          setLocaleOpen(open);
          if (open) setThemeOpen(false);
        }}
      >
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-9 w-full opacity-0"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={menuSide}
          align="center"
          avoidCollisions={false}
          className="w-44"
        >
          <DropdownMenuLabel>{t("theme.language")}</DropdownMenuLabel>
          {LOCALES.map((locale) => (
            <DropdownMenuItem key={locale} onSelect={() => setLocale(locale)}>
              <span className="flex-1">{t(`languages.${locale}`)}</span>
              {locale === current && <CheckIcon />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu
        open={themeOpen}
        onOpenChange={(open) => {
          setThemeOpen(open);
          if (open) setLocaleOpen(false);
        }}
      >
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-9 w-full opacity-0"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={menuSide}
          align="center"
          avoidCollisions={false}
          className="w-44"
        >
          <DropdownMenuLabel>{t("theme.themeColor")}</DropdownMenuLabel>
          {themes.map((theme) => (
            <DropdownMenuItem key={theme.id} onSelect={() => setTheme(theme.id)}>
              <span
                className="size-4 rounded-full border"
                style={{ backgroundColor: theme.swatch }}
              />
              <span className="flex-1">{theme.label}</span>
              {theme.id === themeId && <CheckIcon />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="relative z-10 flex w-full items-center justify-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("theme.changeLanguage")}
          aria-expanded={localeOpen}
          aria-haspopup="menu"
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => {
            setThemeOpen(false);
            setLocaleOpen((open) => !open);
          }}
        >
          <LanguagesIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("theme.changeTheme")}
          aria-expanded={themeOpen}
          aria-haspopup="menu"
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => {
            setLocaleOpen(false);
            setThemeOpen((open) => !open);
          }}
        >
          <PaletteIcon />
        </Button>
        <ModeToggle />
      </div>
    </div>
  );
}
