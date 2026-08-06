import type { TenantRole } from "@app/shared";
import { cn } from "@/lib/utils";

type Props = {
  value: TenantRole;
  onChange: (role: TenantRole) => void;
  /** Owner is assignable only when transferring ownership; hidden by default. */
  includeOwner?: boolean;
  className?: string;
};

/** Native select styled to match inputs, for picking a tenant role. */
export function RoleSelect({ value, onChange, includeOwner, className }: Props) {
  return (
    <select
      className={cn(
        "h-9 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-2",
        className,
      )}
      value={value}
      onChange={(e) => onChange(e.target.value as TenantRole)}
    >
      {includeOwner && <option value="owner">owner</option>}
      <option value="admin">admin</option>
      <option value="member">member</option>
    </select>
  );
}
