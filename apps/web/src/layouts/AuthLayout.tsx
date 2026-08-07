import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BoxIcon } from "lucide-react";
import { AuthShell } from "@app/ui/auth-shell";
import { Brand } from "@app/ui/brand";

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <AuthShell
      brand={
        <Link to="/">
          <Brand icon={<BoxIcon className="size-5 text-primary" />}>{t("brand")}</Brand>
        </Link>
      }
      title={title}
      description={description}
      footer={footer}
    >
      {children}
    </AuthShell>
  );
}
