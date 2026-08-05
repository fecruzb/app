import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import type { PublicInviteDto } from "@app/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/layouts/AuthLayout";
import { api, ApiError } from "@/api";
import { useAuth } from "@/providers/auth";

export function AcceptInvitePage() {
  const { token } = useParams();
  const { me, isLoading: authLoading, refresh } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    data: invite,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["invite", token],
    queryFn: () => api.get<PublicInviteDto>(`/invites/${token}`),
    retry: false,
  });

  async function accept(body?: { name: string; password: string }) {
    setSubmitting(true);
    try {
      const result = await api.post<{ tenantSlug: string }>(`/invites/${token}/accept`, body);
      await refresh();
      toast.success(`Welcome to ${invite?.tenantName}!`);
      navigate(`/app/${result.tenantSlug}`, { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to accept invite");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNewAccount(e: FormEvent) {
    e.preventDefault();
    void accept({ name, password });
  }

  if (isLoading || authLoading) {
    return (
      <AuthLayout title="Invite">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" /> Loading invite...
        </div>
      </AuthLayout>
    );
  }

  if (error || !invite) {
    return (
      <AuthLayout title="Invalid invite" description="This invite doesn't exist or has expired.">
        <Button variant="outline" asChild>
          <Link to="/">Go to home</Link>
        </Button>
      </AuthLayout>
    );
  }

  // Logged in: just confirm (the API checks the email matches)
  if (me) {
    return (
      <AuthLayout
        title={`Invitation to ${invite.tenantName}`}
        description={`You've been invited as ${invite.role === "admin" ? "an administrator" : "a member"}.`}
      >
        {me.user.email === invite.email ? (
          <Button className="w-full" disabled={submitting} onClick={() => void accept()}>
            {submitting ? "Joining..." : `Join ${invite.tenantName}`}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            This invite is for <strong>{invite.email}</strong>, but you're signed in as{" "}
            <strong>{me.user.email}</strong>. Sign out of the current account to accept.
          </p>
        )}
      </AuthLayout>
    );
  }

  // Logged out with an existing account: sign in first
  if (invite.userExists) {
    return (
      <AuthLayout
        title={`Invitation to ${invite.tenantName}`}
        description={`Sign in with the account ${invite.email} to accept the invite.`}
      >
        <Button className="w-full" asChild>
          <Link to="/login" state={{ from: `/invite/${token}` }}>
            Sign in
          </Link>
        </Button>
      </AuthLayout>
    );
  }

  // Logged out without an account: create one on the spot
  return (
    <AuthLayout
      title={`Invitation to ${invite.tenantName}`}
      description={`Create your account with the email ${invite.email} to join.`}
    >
      <form onSubmit={handleNewAccount} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Minimum of 8 characters</p>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create account and join"}
        </Button>
      </form>
    </AuthLayout>
  );
}
