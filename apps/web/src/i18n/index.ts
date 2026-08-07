import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { brand } from "@app/shared";
import en from "./locales/en.json";
import pt from "./locales/pt.json";
import landingEn from "./locales/landing.en.json";
import landingPt from "./locales/landing.pt.json";

export const LOCALES = ["en", "pt"] as const;
export type Locale = (typeof LOCALES)[number];

export const LANG_KEY = "app:lang";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "pt";
}

/** BCP 47 tag for dates and numbers (Brazilian Portuguese for `pt`). */
export function dateLocale(lang: string = i18n.language): string {
  return lang.startsWith("pt") ? "pt-BR" : "en-US";
}

function detectLocale(): Locale {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem(LANG_KEY);
    if (isLocale(stored)) return stored;
  }
  if (typeof navigator !== "undefined") {
    const nav = navigator.language.toLowerCase();
    if (nav.startsWith("pt")) return "pt";
  }
  return "en";
}

function points(t: typeof i18n.t, key: string): string[] {
  const value = t(key, { returnObjects: true });
  return Array.isArray(value) ? (value as string[]) : [];
}

export { points };

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { ...en, landing: landingEn } },
    pt: { translation: { ...pt, landing: landingPt } },
  },
  lng: detectLocale(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
    // Product identity from packages/shared — `{{brand}}` / `{{tagline}}` / `{{repoUrl}}`.
    defaultVariables: {
      brand: brand.displayName,
      tagline: brand.tagline,
      repoUrl: brand.repoUrl,
    },
  },
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language;
}

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
