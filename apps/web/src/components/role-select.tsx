import type { TenantRole } from "@app/shared";
import { useTranslation } from "react-i18next";
import { cn } from "@app/ui/lib/utils";

type Props = {
  value: TenantRole;
  onChange: (role: TenantRole) => void;
  /** Owner is assignable only when transferring ownership; hidden by default. */
  includeOwner?: boolean;
  className?: string;
};

/** Native select styled to match inputs, for picking a tenant role. */
export function RoleSelect({ value, onChange, includeOwner, className }: Props) {
  const { t } = useTranslation();
  return (
    <select
      className={cn(
        "h-9 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-2",
        className,
      )}
      value={value}
      onChange={(e) => onChange(e.target.value as TenantRole)}
    >
      {includeOwner && <option value="owner">{t("roles.owner")}</option>}
      <option value="admin">{t("roles.admin")}</option>
      <option value="member">{t("roles.member")}</option>
    </select>
  );
}
