import { useTranslation } from "react-i18next";
import { PageHeader } from "@app/ui/page-header";
import { PasswordSection } from "../components/password-section";
import { ProfileSection } from "../components/profile-section";

export function AccountPage() {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6">
      <PageHeader title={t("account.title")} description={t("account.description")} />
      <ProfileSection />
      <PasswordSection />
    </div>
  );
}
