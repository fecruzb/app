import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@app/ui/button";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ApiError } from "@/lib/api";
import { useAppConfig } from "@/app/config";
import { authApi } from "../api";
import { useAuth } from "../auth-provider";

export function LoginPage() {
  const { t } = useTranslation();
  const { setMe } = useAuth();
  const { selfSignupEnabled } = useAppConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const me = await authApi.login({ email, password });
      setMe(me);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? "/app", { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("auth.signInFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title={t("auth.signIn")}
      description={t("auth.signInDescription")}
      footer={
        selfSignupEnabled && (
          <span>
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="font-medium text-foreground hover:underline">
              {t("auth.createAccount")}
            </Link>
          </span>
        )
      }
    >
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
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("common.password")}</Label>
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:underline">
              {t("auth.forgotPassword")}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? t("auth.signingIn") : t("auth.signIn")}
        </Button>
      </form>
    </AuthLayout>
  );
}
