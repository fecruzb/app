import { useTranslation } from "react-i18next";
import { PageHeader } from "@app/ui/page-header";
import { ApiKeysSection } from "../components/api-keys-section";

export function IntegrationsPage() {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6">
      <PageHeader title={t("integrations.title")} description={t("integrations.description")} />
      <ApiKeysSection />
    </div>
  );
}
