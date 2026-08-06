import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@app/ui/button";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ApiError } from "@/lib/api";
import { authApi } from "../api";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("auth.sendFailed"));
    } finally {
      setSubmitting(false);
    }
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
          <Button type="submit" disabled={submitting}>
            {submitting ? t("common.sending") : t("auth.sendLink")}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
