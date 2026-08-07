import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_MODE,
  DEFAULT_THEME,
  defaultThemes,
  getTheme,
  type Mode,
  type Theme,
} from "./themes";

type ThemeContextValue = {
  /** The active color theme (primary palette). */
  themeId: string;
  /** Light or dark surfaces. */
  mode: Mode;
  /** Active catalog (built-ins and/or consumer extras). */
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
export function applyTheme(themeId: string, mode: Mode, catalog: Theme[] = defaultThemes): void {
  const root = document.documentElement;
  const theme = getTheme(themeId, catalog);
  const tokens = mode === "dark" ? theme.dark : theme.light;
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(key, value);
  }
  root.classList.toggle("dark", mode === "dark");
  root.dataset.theme = theme.id;
  // Lets the browser render native controls (scrollbars, inputs) to match.
  root.style.colorScheme = mode;
}

export function ThemeProvider({
  children,
  themes = defaultThemes,
  defaultThemeId = DEFAULT_THEME,
  defaultMode = DEFAULT_MODE,
  storageKeyPrefix = "app",
}: {
  children: ReactNode;
  /** Theme catalog. Defaults to kit built-ins; pass `[...defaultThemes, brand]` to extend. */
  themes?: Theme[];
  defaultThemeId?: string;
  defaultMode?: Mode;
  /** Prefix for localStorage keys (`{prefix}:theme`, `{prefix}:mode`). */
  storageKeyPrefix?: string;
}) {
  const themeKey = `${storageKeyPrefix}:theme`;
  const modeKey = `${storageKeyPrefix}:mode`;

  const [themeId, setThemeIdState] = useState(() => read(themeKey, defaultThemeId));
  const [mode, setModeState] = useState<Mode>(() => read(modeKey, defaultMode) as Mode);

  // If the stored id isn't in the active catalog, fall back to the default.
  const resolvedThemeId = themes.some((t) => t.id === themeId) ? themeId : defaultThemeId;

  useEffect(() => {
    applyTheme(resolvedThemeId, mode, themes);
  }, [resolvedThemeId, mode, themes]);

  const setTheme = useCallback(
    (id: string) => {
      setThemeIdState(id);
      localStorage.setItem(themeKey, id);
    },
    [themeKey],
  );

  const setMode = useCallback(
    (next: Mode) => {
      setModeState(next);
      localStorage.setItem(modeKey, next);
    },
    [modeKey],
  );

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(modeKey, next);
      return next;
    });
  }, [modeKey]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeId: resolvedThemeId,
      mode,
      themes,
      setTheme,
      setMode,
      toggleMode,
    }),
    [resolvedThemeId, mode, themes, setTheme, setMode, toggleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
