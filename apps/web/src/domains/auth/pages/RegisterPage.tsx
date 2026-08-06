import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@app/ui/button";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ApiError } from "@/lib/api";
import { useAppConfig } from "@/app/config";
import { authApi } from "../api";
import { useAuth } from "../context/auth-provider";

export function RegisterPage() {
  const { t } = useTranslation();
  const { setMe } = useAuth();
  const { selfSignupEnabled } = useAppConfig();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const me = await authApi.register({ name, email, password });
      setMe(me);
      toast.success(t("auth.accountCreated"));
      navigate("/app", { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("auth.createFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!selfSignupEnabled) {
    return (
      <AuthLayout
        title={t("auth.inviteOnlyTitle")}
        description={t("auth.inviteOnlyDescription")}
        footer={
          <Link to="/login" className="font-medium text-foreground hover:underline">
            {t("auth.backToSignIn")}
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">{t("auth.inviteOnlyHint")}</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t("auth.createAccount")}
      description={t("auth.createAccountDescription")}
      footer={
        <span>
          {t("auth.alreadyHaveAccount")}{" "}
          <Link to="/login" className="font-medium text-foreground hover:underline">
            {t("auth.signIn")}
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">{t("common.name")}</Label>
          <Input
            id="name"
            autoComplete="name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
          <Label htmlFor="password">{t("common.password")}</Label>
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
          {submitting ? t("common.creating") : t("auth.createAccount")}
        </Button>
      </form>
    </AuthLayout>
  );
}
