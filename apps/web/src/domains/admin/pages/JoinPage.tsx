import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@app/ui/button";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/domains/auth/auth-provider";
import { adminApi } from "../api";

export function JoinPage() {
  const { t } = useTranslation();
  const { token } = useParams();
  const { me, isLoading: authLoading, setMe, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    data: invite,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["platform-invite", token],
    queryFn: () => adminApi.getJoinInvite(token!),
    enabled: !!token,
    retry: false,
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const next = await adminApi.acceptJoinInvite(token!, { name, password });
      setMe(next);
      toast.success(t("join.welcome"));
      navigate("/app", { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("join.acceptFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || authLoading) {
    return (
      <AuthLayout title={t("join.title")}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" /> {t("join.loading")}
        </div>
      </AuthLayout>
    );
  }

  if (error || !invite) {
    return (
      <AuthLayout title={t("join.invalidTitle")} description={t("join.invalidDescription")}>
        <Button variant="outline" asChild>
          <Link to="/">{t("join.goHome")}</Link>
        </Button>
      </AuthLayout>
    );
  }

  if (me) {
    return (
      <AuthLayout title={t("join.title")} description={t("join.alreadySignedIn")}>
        <div className="grid gap-3">
          <Button className="w-full" asChild>
            <Link to="/app">{t("join.goToApp")}</Link>
          </Button>
          <Button variant="outline" className="w-full" onClick={() => void logout()}>
            {t("join.signOutToAccept")}
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (invite.userExists) {
    return (
      <AuthLayout
        title={t("join.title")}
        description={t("join.signInInstead", { email: invite.email })}
      >
        <Button className="w-full" asChild>
          <Link to="/login">{t("auth.signIn")}</Link>
        </Button>
      </AuthLayout>
    );
  }

  const description = invite.inviterName
    ? t("join.invitedBy", { name: invite.inviterName, email: invite.email })
    : t("join.invited", { email: invite.email });

  return (
    <AuthLayout title={t("join.createAccount")} description={description}>
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
          {submitting ? t("common.creating") : t("join.createAndContinue")}
        </Button>
      </form>
    </AuthLayout>
  );
}
