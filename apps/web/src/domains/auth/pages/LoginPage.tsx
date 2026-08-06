import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@app/ui/button";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { AuthLayout } from "@/layouts/AuthLayout";
import { showApiError } from "@/lib/api";
import { useAppConfig } from "@/app/config";
import { authApi } from "../api";
import { useAuth } from "../context/auth-provider";

export function LoginPage() {
  const { t } = useTranslation();
  const { setMe } = useAuth();
  const { selfSignupEnabled } = useAppConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => authApi.login({ email, password }),
    onSuccess: (me) => {
      setMe(me);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? "/app", { replace: true });
    },
    onError: (err) => showApiError(err, t("auth.signInFailed")),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    loginMutation.mutate();
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
        <Button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? t("auth.signingIn") : t("auth.signIn")}
        </Button>
      </form>
    </AuthLayout>
  );
}
