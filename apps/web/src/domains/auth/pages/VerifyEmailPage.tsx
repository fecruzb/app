import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2Icon, Loader2Icon, XCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ApiError } from "@/lib/api";
import { authApi } from "../api";
import { useAuth } from "../auth-provider";

export function VerifyEmailPage() {
  const { token } = useParams();
  const { refresh } = useAuth();

  const { isLoading, error } = useQuery({
    queryKey: ["verify-email", token],
    queryFn: async () => {
      const result = await authApi.verifyEmail({ token });
      await refresh();
      return result;
    },
    retry: false,
  });

  return (
    <AuthLayout title="Email verification">
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" /> Verifying...
        </div>
      ) : error ? (
        <div className="grid gap-4">
          <div className="flex items-start gap-2 text-sm">
            <XCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
            <span>{error instanceof ApiError ? error.message : "Failed to verify email"}</span>
          </div>
          <Button variant="outline" asChild>
            <Link to="/app">Go to app</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-green-600" />
            <span>Email verified successfully!</span>
          </div>
          <Button asChild>
            <Link to="/app">Go to app</Link>
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
