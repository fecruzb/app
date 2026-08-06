import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@app/ui/button";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ApiError } from "@/lib/api";
import { authApi } from "../api";
import { useAuth } from "../context/auth-provider";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const { token } = useParams();
  const { setMe } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const me = await authApi.resetPassword({ token, password });
      setMe(me);
      toast.success(t("auth.passwordReset"));
      navigate("/app", { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("auth.resetFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title={t("auth.newPasswordTitle")}
      description={t("auth.newPasswordDescription")}
      footer={
        <Link to="/forgot-password" className="font-medium text-foreground hover:underline">
          {t("auth.requestNewLink")}
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="password">{t("auth.newPassword")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{t("common.minPassword")}</p>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? t("common.saving") : t("auth.resetPassword")}
        </Button>
      </form>
    </AuthLayout>
  );
}
