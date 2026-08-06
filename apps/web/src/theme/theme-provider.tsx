import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_MODE,
  DEFAULT_THEME,
  getTheme,
  themes,
  type Mode,
  type Theme,
} from "./themes";

const THEME_KEY = "app:theme";
const MODE_KEY = "app:mode";

type ThemeContextValue = {
  /** The active color theme (primary palette). */
  themeId: string;
  /** Light or dark surfaces. */
  mode: Mode;
  themes: Theme[];
  setTheme: (id: string) => void;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function read(key: string, fallback: string): string {
  if (typeof localStorage === "undefined") return fallback;
  return localStorage.getItem(key) ?? fallback;
}

/**
 * Writes the chosen theme's tokens for the given mode onto `<html>` as inline
 * CSS variables, and toggles the `dark` class so any `dark:` utility still
 * works. This is the single place that turns a theme object into live styles.
 */
export function applyTheme(themeId: string, mode: Mode): void {
  const root = document.documentElement;
  const theme = getTheme(themeId);
  const tokens = mode === "dark" ? theme.dark : theme.light;
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(key, value);
  }
  root.classList.toggle("dark", mode === "dark");
  root.dataset.theme = theme.id;
  // Lets the browser render native controls (scrollbars, inputs) to match.
  root.style.colorScheme = mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState(() => read(THEME_KEY, DEFAULT_THEME));
  const [mode, setModeState] = useState<Mode>(() => read(MODE_KEY, DEFAULT_MODE) as Mode);

  useEffect(() => {
    applyTheme(themeId, mode);
  }, [themeId, mode]);

  const setTheme = useCallback((id: string) => {
    setThemeIdState(id);
    localStorage.setItem(THEME_KEY, id);
  }, []);

  const setMode = useCallback((next: Mode) => {
    setModeState(next);
    localStorage.setItem(MODE_KEY, next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(MODE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ themeId, mode, themes, setTheme, setMode, toggleMode }),
    [themeId, mode, setTheme, setMode, toggleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
