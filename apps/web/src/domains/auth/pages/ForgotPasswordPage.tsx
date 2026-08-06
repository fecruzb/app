import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@app/ui/button";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { AuthLayout } from "@/layouts/AuthLayout";
import { showApiError } from "@/lib/api";
import { authApi } from "../api";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const forgotMutation = useMutation({
    mutationFn: () => authApi.forgotPassword({ email }),
    onSuccess: () => setSent(true),
    onError: (err) => showApiError(err, t("auth.sendFailed")),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    forgotMutation.mutate();
  }

  return (
    <AuthLayout
      title={t("auth.recoverTitle")}
      description={t("auth.recoverDescription")}
      footer={
        <Link to="/login" className="font-medium text-foreground hover:underline">
          {t("auth.backToSignIn")}
        </Link>
      }
    >
      {sent ? (
        <p className="text-sm text-muted-foreground">
          <Trans
            i18nKey="auth.recoverSent"
            values={{ email }}
            components={{ strong: <strong /> }}
          />
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">{t("common.email")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={forgotMutation.isPending}>
            {forgotMutation.isPending ? t("common.sending") : t("auth.sendLink")}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
