import { CheckIcon, LanguagesIcon } from "lucide-react";
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
import i18n, { LANG_KEY, LOCALES, type Locale } from "./index";

/** Persists the choice and switches the active language. */
export function setLocale(locale: Locale) {
  localStorage.setItem(LANG_KEY, locale);
  void i18n.changeLanguage(locale);
}

/** Dropdown that switches the UI language (EN / PT). */
export function LocalePicker({
  className,
  side = "bottom",
}: {
  className?: string;
  side?: "top" | "bottom";
}) {
  const { t, i18n: i18nInstance } = useTranslation();
  const current = (
    LOCALES.includes(i18nInstance.language as Locale)
      ? i18nInstance.language
      : i18nInstance.language.startsWith("pt")
        ? "pt"
        : "en"
  ) as Locale;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("theme.changeLanguage")}
          className={className}
        >
          <LanguagesIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side={side} avoidCollisions={false} className="w-44">
        <DropdownMenuLabel>{t("theme.language")}</DropdownMenuLabel>
        {LOCALES.map((locale) => (
          <DropdownMenuItem key={locale} onSelect={() => setLocale(locale)}>
            <span className="flex-1">{t(`languages.${locale}`)}</span>
            {locale === current && <CheckIcon />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Language control alone — pair with ThemeControls in headers/sidebars. */
export function LocaleControls({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center", className)}>
      <LocalePicker />
    </div>
  );
}
