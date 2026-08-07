import { useTranslation } from "react-i18next";
import { BrandIcon } from "../brand-icon";

const stackItems: {
  labelKey: "frontend" | "backend" | "database" | "ai" | "tooling";
  items: string[];
}[] = [
  { labelKey: "frontend", items: ["React 19", "Vite", "Tailwind", "shadcn/ui", "TanStack Query"] },
  { labelKey: "backend", items: ["Hono", "Zod", "Node"] },
  { labelKey: "database", items: ["PostgreSQL", "Drizzle ORM"] },
  { labelKey: "ai", items: ["OpenAI", "Model Context Protocol (MCP)"] },
  { labelKey: "tooling", items: ["TypeScript", "Turborepo", "oxlint", "Prettier"] },
];

export function StackSection() {
  const { t } = useTranslation();

  return (
    <section id="stack" data-section className="scroll-mt-20 bg-muted/40 px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("landing.stackSection.title")}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            {t("landing.stackSection.body")}
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-2xl divide-y rounded-lg border bg-background">
          {stackItems.map((s) => (
            <div
              key={s.labelKey}
              className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:gap-6"
            >
              <p className="w-24 shrink-0 text-sm font-medium">
                {t(`landing.stack.${s.labelKey}`)}
              </p>
              <div className="flex flex-wrap gap-2">
                {s.items.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1 text-xs font-medium"
                  >
                    <BrandIcon name={item} className="size-3.5" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
