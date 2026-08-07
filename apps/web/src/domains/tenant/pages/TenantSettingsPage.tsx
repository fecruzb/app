import { useTranslation } from "react-i18next";
import { PageHeader } from "@app/ui/page-header";
import { GeneralSection } from "../components/general-section";
import { InvitesSection } from "../components/invites-section";
import { MembersSection } from "../components/members-section";
import { useTenant } from "../context/tenant-provider";

export function TenantSettingsPage() {
  const { t } = useTranslation();
  const { isManager } = useTenant();

  return (
    <div className="grid gap-6">
      <PageHeader title={t("settings.title")} description={t("settings.description")} />
      <GeneralSection />
      <MembersSection />
      {isManager && <InvitesSection />}
    </div>
  );
}
