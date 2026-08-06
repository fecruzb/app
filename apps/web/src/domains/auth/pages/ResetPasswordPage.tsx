import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@app/ui/button";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ApiError } from "@/lib/api";
import { authApi } from "../api";
import { useAuth } from "../auth-provider";

export function ResetPasswordPage() {
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
      toast.success("Password reset!");
      navigate("/app", { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="New password"
      description="Choose a new password for your account"
      footer={
        <Link to="/forgot-password" className="font-medium text-foreground hover:underline">
          Request a new link
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="password">New password</Label>
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
          {submitting ? "Saving..." : "Reset password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
