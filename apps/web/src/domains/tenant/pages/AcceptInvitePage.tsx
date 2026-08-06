import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Trans, useTranslation } from "react-i18next";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@app/ui/button";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { AuthLayout } from "@/layouts/AuthLayout";
import { showApiError } from "@/lib/api";
import { useAuth } from "@/domains/auth/context/auth-provider";
import { tenantApi } from "../api";

export function AcceptInvitePage() {
  const { t } = useTranslation();
  const { token } = useParams();
  const { me, isLoading: authLoading, refresh } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const {
    data: invite,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["invite", token],
    queryFn: () => tenantApi.getInvite(token!),
    enabled: !!token,
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: (body?: { name: string; password: string }) => tenantApi.acceptInvite(token!, body),
    onSuccess: async (result) => {
      await refresh();
      toast.success(t("invite.welcome", { tenant: invite?.tenantName }));
      navigate(`/app/${result.tenantSlug}`, { replace: true });
    },
    onError: (err) => showApiError(err, t("invite.acceptFailed")),
  });

  function handleNewAccount(e: FormEvent) {
    e.preventDefault();
    acceptMutation.mutate({ name, password });
  }

  if (isLoading || authLoading) {
    return (
      <AuthLayout title={t("invite.title")}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" /> {t("invite.loading")}
        </div>
      </AuthLayout>
    );
  }

  if (error || !invite) {
    return (
      <AuthLayout title={t("invite.invalidTitle")} description={t("invite.invalidDescription")}>
        <Button variant="outline" asChild>
          <Link to="/">{t("invite.goHome")}</Link>
        </Button>
      </AuthLayout>
    );
  }

  // Logged in: just confirm (the API checks the email matches)
  if (me) {
    return (
      <AuthLayout
        title={t("invite.invitationTo", { tenant: invite.tenantName })}
        description={
          invite.role === "admin" ? t("invite.invitedAsAdmin") : t("invite.invitedAsMember")
        }
      >
        {me.user.email === invite.email ? (
          <Button
            className="w-full"
            disabled={acceptMutation.isPending}
            onClick={() => acceptMutation.mutate(undefined)}
          >
            {acceptMutation.isPending
              ? t("invite.joining")
              : t("invite.join", { tenant: invite.tenantName })}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            <Trans
              i18nKey="invite.emailMismatch"
              values={{ inviteEmail: invite.email, yourEmail: me.user.email }}
              components={{ strong: <strong /> }}
            />
          </p>
        )}
      </AuthLayout>
    );
  }

  // Logged out with an existing account: sign in first
  if (invite.userExists) {
    return (
      <AuthLayout
        title={t("invite.invitationTo", { tenant: invite.tenantName })}
        description={t("invite.signInToAccept", { email: invite.email })}
      >
        <Button className="w-full" asChild>
          <Link to="/login" state={{ from: `/invite/${token}` }}>
            {t("auth.signIn")}
          </Link>
        </Button>
      </AuthLayout>
    );
  }

  // Logged out without an account: create one on the spot
  return (
    <AuthLayout
      title={t("invite.invitationTo", { tenant: invite.tenantName })}
      description={t("invite.createToJoin", { email: invite.email })}
    >
      <form onSubmit={handleNewAccount} className="grid gap-4">
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
        <Button type="submit" disabled={acceptMutation.isPending}>
          {acceptMutation.isPending ? t("common.creating") : t("invite.createAndJoin")}
        </Button>
      </form>
    </AuthLayout>
  );
}
