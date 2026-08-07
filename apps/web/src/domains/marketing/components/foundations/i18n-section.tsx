import { useTranslation } from "react-i18next";
import { CheckIcon, LanguagesIcon } from "lucide-react";
import { LOCALES, points, type Locale } from "@/i18n";
import { setLocale } from "@/i18n/locale-controls";
import { CodeBlock } from "@app/ui/code-block";

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
    <section className="border-t px-4 py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="reveal reveal-delay min-w-0 lg:order-1">
          <CodeBlock filename="apps/web/src/i18n/" code={i18nFile} lang="ts" />
        </div>

        <div className="reveal lg:order-2">
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <LanguagesIcon className="size-4" /> {t("landing.i18n.eyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {t("landing.i18n.title")}
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">{t("landing.i18n.body")}</p>
          <ul className="mt-6 space-y-3 text-sm">
            {bullets.map((point) => (
              <li key={point} className="flex gap-2.5">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-4">
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
        </div>
      </div>
    </section>
  );
}
