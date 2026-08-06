import { CheckIcon, MoonIcon, PaletteIcon, SunIcon } from "lucide-react";
import { Button } from "@app/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@app/ui/dropdown-menu";
import { cn } from "@app/ui/lib/utils";
import { useTheme } from "./theme-provider";

/** Icon button that flips between light and dark. */
export function ModeToggle({ className }: { className?: string }) {
  const { mode, toggleMode } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMode}
      aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={className}
    >
      {mode === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}

/** Dropdown that swaps the active color theme (primary palette). */
export function ThemePicker({ className }: { className?: string }) {
  const { themes, themeId, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change theme" className={className}>
          <PaletteIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Theme color</DropdownMenuLabel>
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

/** The two controls side by side — used in the landing header and app sidebar. */
export function ThemeControls({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <ThemePicker />
      <ModeToggle />
    </div>
  );
}
