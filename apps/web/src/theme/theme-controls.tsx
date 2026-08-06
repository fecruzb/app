import { CheckIcon, MoonIcon, PaletteIcon, SunIcon } from "lucide-react";
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
import { LocalePicker } from "@/i18n/locale-controls";
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
export function ThemePicker({ className }: { className?: string }) {
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
      <DropdownMenuContent align="end" className="w-44">
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

/** Language, theme and mode — used in the landing header and app sidebar. */
export function ThemeControls({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <LocalePicker />
      <ThemePicker />
      <ModeToggle />
    </div>
  );
}
