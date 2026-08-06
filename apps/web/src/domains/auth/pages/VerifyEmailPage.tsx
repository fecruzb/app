import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CheckCircle2Icon, Loader2Icon, XCircleIcon } from "lucide-react";
import { Button } from "@app/ui/button";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ApiError } from "@/lib/api";
import { authApi } from "../api";
import { useAuth } from "../context/auth-provider";

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const { token } = useParams();
  const { refresh } = useAuth();

  const { isLoading, error } = useQuery({
    queryKey: ["verify-email", token],
    queryFn: async () => {
      if (!token) throw new Error("Missing token");
      const result = await authApi.verifyEmail({ token });
      await refresh();
      return result;
    },
    retry: false,
  });

  return (
    <AuthLayout title={t("auth.verifyTitle")}>
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" /> {t("auth.verifying")}
        </div>
      ) : error ? (
        <div className="grid gap-4">
          <div className="flex items-start gap-2 text-sm">
            <XCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
            <span>{error instanceof ApiError ? error.message : t("auth.verifyFailed")}</span>
          </div>
          <Button variant="outline" asChild>
            <Link to="/app">{t("auth.goToApp")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{t("auth.verifySuccess")}</span>
          </div>
          <Button asChild>
            <Link to="/app">{t("auth.goToApp")}</Link>
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
