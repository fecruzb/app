import { useTranslation } from "react-i18next";
import { PageHeader } from "@app/ui/page-header";
import { BillingSection } from "../components/billing-section";

export function BillingPage() {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6">
      <PageHeader title={t("billing.title")} description={t("billing.pageDescription")} />
      <BillingSection />
    </div>
  );
}
