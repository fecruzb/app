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
    title: "Autenticação completa",
    description:
      "Login, cadastro, recuperação de senha e verificação de e-mail — sessões seguras em cookie httpOnly.",
  },
  {
    icon: UsersIcon,
    title: "Multi-tenant",
    description:
      "Cada usuário tem seus ambientes. Membros, roles (owner, admin, member) e isolamento de dados por tenant.",
  },
  {
    icon: MailIcon,
    title: "Convites por e-mail",
    description:
      "Convide pessoas para o seu tenant. Elas aceitam com a conta existente ou criam uma na hora.",
  },
  {
    icon: RocketIcon,
    title: "Pronto para produção",
    description:
      "Deploy no Render em um serviço só, migrations automáticas no pre-deploy e health check configurado.",
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
                  Ir para o app <ArrowRightIcon />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                {selfSignupEnabled && (
                  <Button asChild>
                    <Link to="/register">Criar conta</Link>
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
            Template SaaS · React + Hono + Postgres
          </p>
          <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Comece o seu próximo produto com a base pronta
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Usuários, autenticação, tenants, convites e e-mails já funcionando. Troque esta landing
            pelo seu produto e foque no que importa.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            {selfSignupEnabled && !me && (
              <Button size="lg" asChild>
                <Link to="/register">
                  Criar conta grátis <ArrowRightIcon />
                </Link>
              </Button>
            )}
            <Button size="lg" variant="outline" asChild>
              <Link to={me ? "/app" : "/login"}>{me ? "Ir para o app" : "Entrar"}</Link>
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
              <h2 className="text-2xl font-semibold">Pronto para começar?</h2>
              <p className="mt-2 text-muted-foreground">
                Crie sua conta e tenha um ambiente completo em segundos.
              </p>
              <Button size="lg" className="mt-6" asChild>
                <Link to={selfSignupEnabled ? "/register" : "/login"}>
                  Começar agora <ArrowRightIcon />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} App Base</span>
          <span>Feito com React, Hono e Postgres</span>
        </div>
      </footer>
    </div>
  );
}
