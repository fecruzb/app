import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  BoxIcon,
  KeyRoundIcon,
  MailIcon,
  RocketIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppConfig } from "@/providers/config";
import { useAuth } from "@/providers/auth";

const features = [
  {
    icon: KeyRoundIcon,
    title: "Complete authentication",
    description:
      "Login, sign-up, password recovery and email verification — secure sessions in an httpOnly cookie.",
  },
  {
    icon: UsersIcon,
    title: "Multi-tenant",
    description:
      "Every user gets their own environments. Members, roles (owner, admin, member) and per-tenant data isolation.",
  },
  {
    icon: MailIcon,
    title: "Email invites",
    description:
      "Invite people to your tenant. They accept with an existing account or create one on the spot.",
  },
  {
    icon: RocketIcon,
    title: "Production-ready",
    description:
      "Deploy to Render as a single service, automatic migrations on pre-deploy and a configured health check.",
  },
];

export function LandingPage() {
  const { me } = useAuth();
  const { selfSignupEnabled } = useAppConfig();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <BoxIcon className="size-5" />
            App Base
          </Link>
          <nav className="flex items-center gap-2">
            {me ? (
              <Button asChild>
                <Link to="/app">
                  Go to app <ArrowRightIcon />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                {selfSignupEnabled && (
                  <Button asChild>
                    <Link to="/register">Create account</Link>
                  </Button>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-5xl px-4 py-24 text-center">
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            SaaS template · React + Hono + Postgres
          </p>
          <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Start your next product with the groundwork done
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Users, authentication, tenants, invites and emails already working. Swap this landing
            for your product and focus on what matters.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            {selfSignupEnabled && !me && (
              <Button size="lg" asChild>
                <Link to="/register">
                  Create free account <ArrowRightIcon />
                </Link>
              </Button>
            )}
            <Button size="lg" variant="outline" asChild>
              <Link to={me ? "/app" : "/login"}>{me ? "Go to app" : "Sign in"}</Link>
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/40">
          <div className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-16 sm:grid-cols-2">
            {features.map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <f.icon className="mb-2 size-6" />
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription>{f.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-20 text-center">
          <Card className="mx-auto max-w-2xl">
            <CardContent className="p-10">
              <h2 className="text-2xl font-semibold">Ready to get started?</h2>
              <p className="mt-2 text-muted-foreground">
                Create your account and get a full environment in seconds.
              </p>
              <Button size="lg" className="mt-6" asChild>
                <Link to={selfSignupEnabled ? "/register" : "/login"}>
                  Get started <ArrowRightIcon />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} App Base</span>
          <span>Built with React, Hono and Postgres</span>
        </div>
      </footer>
    </div>
  );
}
