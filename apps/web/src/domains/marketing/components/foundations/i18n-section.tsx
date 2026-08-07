import { useTranslation } from "react-i18next";
import { LanguagesIcon } from "lucide-react";
import { LOCALES, points, type Locale } from "@/i18n";
import { setLocale } from "@/i18n/locale-controls";
import { CodeBlock } from "@app/ui/code-block";
import { FeatureSplit } from "../feature-split";

const i18nFile = `// locales/en.json  ·  locales/pt.json — same keys
{
  "tasks": { "title": "Tasks" }    // EN
  "tasks": { "title": "Tarefas" }  // PT
}

// Any component — no wiring beyond useTranslation
const { t } = useTranslation();
return <PageHeader title={t("tasks.title")} />;`;

/**
 * Live i18n demo — the language buttons drive the real i18n instance, so the
 * whole landing (and this section) switch language in place.
 */
export function I18nSection() {
  const { t, i18n } = useTranslation();
  const current = (
    LOCALES.includes(i18n.language as Locale)
      ? i18n.language
      : i18n.language.startsWith("pt")
        ? "pt"
        : "en"
  ) as Locale;
  const bullets = points(t, "landing.i18n.points");

  return (
    <FeatureSplit
      bordered
      density="loose"
      headingAs="h2"
      flip
      eyebrow={
        <>
          <LanguagesIcon className="size-4" />
          {t("landing.i18n.eyebrow")}
        </>
      }
      title={t("landing.i18n.title")}
      body={t("landing.i18n.body")}
      points={bullets}
      visual={<CodeBlock filename="apps/web/src/i18n/" code={i18nFile} lang="ts" />}
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {t("landing.i18n.language")}
          </p>
          <div className="inline-flex rounded-lg border p-1">
            {LOCALES.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => setLocale(locale)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  locale === current
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {t(`languages.${locale}`)}
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{t("landing.i18n.tryIt")}</p>
      </div>
    </FeatureSplit>
  );
}
