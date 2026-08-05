# app-base — Plano

Template de aplicativo SaaS genérico, multi-tenant, com autenticação completa, pronto para iniciar novos produtos. Destilado dos padrões de Zyron, Symulous e Cookbook, **sem depender de nenhum pacote privado** (`@fcbueno/*`, `@symulous/*`, etc.).

## Objetivo

Clonar → renomear → `npm install` → `npm run setup` → `npm run dev` → produto novo com login, cadastro, recuperação de senha, verificação de e-mail, tenants, convites e área pública já funcionando.

---

## 1. Decisões de arquitetura

| Decisão       | Escolha                                              | Racional                                                                                   |
| ------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Monorepo      | **npm workspaces + Turborepo**                       | Padrão do Zyron e Symulous; leve e conhecido                                               |
| Frontend      | **React 19 + Vite 7 (SPA)**                          | Padrão dos repos recentes; sem Next para manter enxuto                                     |
| UI            | **Tailwind v4 + shadcn/ui + lucide-react**           | Padrão Symulous/Cookbook; componentes copiáveis, sem lock-in                               |
| Roteamento    | **react-router v7**                                  | Padrão em todos os SPAs                                                                    |
| Data fetching | **TanStack Query + cliente API fino**                | Cache, revalidação e estados de loading sem boilerplate                                    |
| Forms         | **Estado controlado + Zod**                          | Padrão da casa (nenhum repo usa react-hook-form)                                           |
| API           | **Hono 4 + @hono/node-server + Zod**                 | Padrão em todos os três repos                                                              |
| ORM           | **Drizzle ORM + drizzle-kit + Postgres 16**          | Padrão Zyron/Symulous; migrations geradas, schema tipado                                   |
| Auth          | **Sessão opaca em DB + cookie httpOnly**             | Mais simples que JWT, revogável (deletar linha), padrão Cookbook                           |
| Hash de senha | **scrypt nativo (`node:crypto`)**                    | Zero dependência, formato `salt$hash` (padrão Cookbook)                                    |
| E-mail        | **Resend via HTTP + fallback de log em dev**         | Padrão Zyron/Symulous; sem chave = loga o HTML no console                                  |
| Deploy        | **Render (`render.yaml`)**: 1 web service + Postgres | SPA servida pela própria API em produção → uma origem, cookie simples, um serviço só       |
| Jobs/worker   | **Não incluir**                                      | E-mail é enviado direto (fire-and-forget). Worker/Redis entra depois se o produto precisar |
| i18n          | **Não incluir**                                      | Strings em pt-BR direto; adicionar i18next depois se precisar                              |
| Lint/format   | **oxlint + Prettier**                                | Rápido e enxuto (padrão Cookbook)                                                          |
| Node          | **≥ 22**, gerenciado por Volta                       | Padrão dos repos                                                                           |

### Por que sessão + cookie e não JWT?

Zyron e Symulous usam JWT porque têm web/desktop/admin em domínios distintos. O app-base é uma origem só (API serve o SPA em produção; proxy do Vite em dev), então cookie httpOnly + sessão em banco é mais simples, mais seguro (nada em `localStorage`) e revogável. Se um produto derivado precisar de apps em domínios separados, troca-se depois.

---

## 2. Estrutura do monorepo

```
app-base/
├── apps/
│   ├── api/                  # Hono + Drizzle
│   │   ├── src/
│   │   │   ├── index.ts      # bootstrap: migrations, rotas, serve dist/ em prod
│   │   │   ├── db/
│   │   │   │   ├── schema.ts # schema Drizzle completo
│   │   │   │   ├── client.ts # pool pg + drizzle
│   │   │   │   └── seed.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts   # requireAuth: cookie → sessão → user no context
│   │   │   │   └── tenant.ts # requireTenant: param → membership → tenant no context
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts   # register, login, logout, me, forgot, reset, verify
│   │   │   │   ├── tenants.ts# CRUD tenant, membros, convites, switch
│   │   │   │   └── notes.ts  # recurso de exemplo (CRUD por tenant)
│   │   │   ├── services/
│   │   │   │   ├── auth.ts   # scrypt, sessões, action tokens
│   │   │   │   ├── email.ts  # Resend ou console.log
│   │   │   │   └── emails/   # templates HTML (verify, reset, invite)
│   │   │   └── lib/          # env, errors, helpers
│   │   ├── drizzle/          # migrations geradas
│   │   └── drizzle.config.ts
│   └── web/                  # React SPA
│       ├── src/
│       │   ├── main.tsx / App.tsx (router)
│       │   ├── lib/api.ts    # fetch com credentials + handler 401
│       │   ├── providers/    # AuthProvider, TenantProvider
│       │   ├── components/ui/# shadcn
│       │   ├── pages/
│       │   │   ├── public/   # Landing, Login, Register, Forgot, Reset, Verify, Invite
│       │   │   └── app/      # Dashboard, Notes, Settings (perfil, tenant, membros)
│       │   └── layouts/      # PublicLayout, AppLayout (sidebar, tenant switcher)
│       └── vite.config.ts    # proxy /api → :3001 em dev
├── packages/
│   └── shared/               # tipos + schemas Zod compartilhados (zero deps além de zod)
├── docker-compose.yml        # Postgres 16
├── render.yaml
├── turbo.json
├── package.json              # workspaces: apps/*, packages/*
└── README.md                 # como rodar, como derivar um produto novo
```

---

## 3. Modelo de dados

```
users             id, name, email (unique), password_hash, email_verified_at,
                  created_at, updated_at
sessions          id, token_hash, user_id → users, expires_at, created_at
tenants           id, name, slug (unique), created_at
tenant_members    tenant_id → tenants, user_id → users, role, created_at
                  PK (tenant_id, user_id)
tenant_invites    id, tenant_id, email, role, token_hash, invited_by, expires_at
action_tokens     id, user_id, purpose ('verify_email' | 'reset_password'),
                  token_hash, expires_at
notes (exemplo)   id, tenant_id, author_id, title, content, timestamps
```

- **Roles por tenant:** `owner` | `admin` | `member`. Usuário pode pertencer a vários tenants (padrão Symulous, mais flexível que o 1:1 do Zyron).
- **Tokens sempre hasheados** no banco (SHA-256); o valor cru só vai no e-mail/cookie.
- **Isolamento:** toda query de recurso filtra por `tenant_id` vindo do middleware, nunca do body.

## 4. Fluxos de autenticação

1. **Cadastro** — cria user + tenant pessoal (owner) + sessão; dispara e-mail de verificação (não bloqueia o uso; banner "verifique seu e-mail" no app).
2. **Login** — email/senha → scrypt verify → sessão (30 dias) → cookie httpOnly SameSite=Lax.
3. **Logout** — deleta sessão + limpa cookie.
4. **Esqueci a senha** — token 1h por e-mail → `/reset-password/:token` → nova senha → invalida todas as sessões.
5. **Verificação de e-mail** — token 24h → `/verify-email/:token`.
6. **Convite** — admin/owner convida por e-mail → `/invite/:token` → aceita logado (vira membro) ou cria conta na hora.
7. **Flag `SELF_SIGNUP_ENABLED`** — env para desligar cadastro público e operar só por convite (padrão Zyron).

## 5. Multi-tenancy

- **Resolução por path:** frontend `/app/:tenantSlug/...`; API `/api/tenants/:tenantId/...`.
- Middleware `requireTenant` valida membership e injeta `{ tenant, role }` no context; `requireRole('admin')` para ações de gestão.
- **Tenant switcher** no AppLayout; `/app` redireciona para o último tenant usado (localStorage).
- Settings do tenant: renomear, membros (listar, alterar role, remover), convites pendentes.

## 6. Rotas do frontend

**Públicas:** `/` (landing com hero + CTAs), `/login`, `/register`, `/forgot-password`, `/reset-password/:token`, `/verify-email/:token`, `/invite/:token`.

**Logadas (AuthProvider + guard):** `/app` (redirect), `/app/:tenantSlug` (dashboard), `/app/:tenantSlug/notes` (exemplo CRUD), `/app/:tenantSlug/settings` (tenant + membros), `/account` (perfil, senha).

## 7. Ambiente e deploy

- **Dev:** `docker compose up -d` (Postgres :5442) → `npm run dev` (turbo: API :3001 + Vite :5173 com proxy). E-mails logados no console.
- **Prod (Render):** um web service Node (`npm run build` → API serve `apps/web/dist`), Postgres gerenciado, `preDeployCommand` roda migrations, health check `/api/health`, bind `0.0.0.0:$PORT`, secrets `sync: false`.
- **Env vars:** `DATABASE_URL`, `RESEND_API_KEY` (opcional), `MAIL_FROM`, `APP_URL`, `SELF_SIGNUP_ENABLED`, `COOKIE_SECRET`.

## 8. Etapas de implementação

1. **Scaffolding** — workspaces, turbo, tsconfigs, oxlint/prettier, docker-compose, README.
2. **`packages/shared`** — tipos e schemas Zod (auth, tenant, note).
3. **API: núcleo** — Hono, env, health, Drizzle schema + migrations + seed.
4. **API: auth** — scrypt, sessões, cookies, todos os fluxos, e-mails com templates.
5. **API: tenants + notes** — middlewares, CRUD, convites, roles.
6. **Web: base** — Vite, Tailwind v4, shadcn, router, cliente API, providers.
7. **Web: páginas públicas** — landing bonita e genérica + telas de auth completas.
8. **Web: área logada** — AppLayout (sidebar + switcher), dashboard, notes, settings, account.
9. **Deploy + polish** — render.yaml, seed de demo, README "como derivar um produto".

## 9. Fora de escopo (adicionar por produto, se precisar)

Google OAuth, worker/filas (Redis), i18n, billing/planos, upload de arquivos (R2), admin interno, testes e2e, app desktop/mobile.
