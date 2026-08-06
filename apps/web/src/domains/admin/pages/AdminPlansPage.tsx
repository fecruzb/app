import { useTranslation } from "react-i18next";
import { EmptyState } from "@app/ui/empty-state";
import { PageHeader } from "@app/ui/page-header";

export function AdminPlansPage() {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6">
      <PageHeader title={t("admin.plans.title")} description={t("admin.plans.description")} />
      <EmptyState>{t("admin.plans.empty")}</EmptyState>
    </div>
  );
}
