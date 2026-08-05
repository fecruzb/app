# app-base

Template de aplicativo SaaS multi-tenant, pronto para virar um produto novo. Vem com usuários, autenticação completa, tenants com membros e convites, e-mails transacionais, site público e deploy no Render.

## Stack

| Camada   | Tecnologia                                                                          |
| -------- | ----------------------------------------------------------------------------------- |
| Frontend | React 19 + Vite, Tailwind CSS v4, shadcn/ui, react-router v7, TanStack Query        |
| API      | Hono + Zod (Node)                                                                   |
| Banco    | PostgreSQL 16 + Drizzle ORM (migrations com drizzle-kit)                            |
| Auth     | Sessão opaca em banco + cookie httpOnly (senha com scrypt nativo, zero dependência) |
| E-mail   | Resend via HTTP (sem chave, loga no console em dev)                                 |
| Monorepo | npm workspaces + Turborepo · lint com oxlint · format com Prettier                  |

Em produção a API serve o SPA buildado — **uma origem, um serviço só**, cookies simples.

## Rodando localmente

Pré-requisitos: Node ≥ 22, Docker.

```bash
npm install
npm run setup   # sobe o Postgres (Docker), roda migrations e seed
npm run dev     # API em :5000 + web em :3000 (proxy /api)
```

Abra http://localhost:3000 e entre com o usuário demo: `demo@example.com` / `demo1234`.

Sem `RESEND_API_KEY`, os e-mails (verificação, reset de senha, convites) são logados no console da API — copie o link de lá para testar os fluxos.

## O que já vem pronto

- **Auth**: cadastro, login, logout, recuperação de senha, verificação de e-mail, troca de senha (encerra outras sessões)
- **Multi-tenant**: todo usuário nasce com um tenant pessoal (não há criação manual); entra em outros apenas por convite. O seletor de tenant só aparece quando participa de 2+. Roles `owner` / `admin` / `member` e isolamento de dados por middleware
- **Convites**: por e-mail, com aceite por conta existente ou criação de conta na hora
- **Site público**: landing com CTAs + telas de auth, separado da área logada
- **Recurso de exemplo**: `notes` — CRUD por tenant, ponta a ponta (schema → rota → página)
- **Flag `SELF_SIGNUP_ENABLED`**: desligue para operar só por convite

## Estrutura

```
apps/api        Hono + Drizzle (rotas finas, services, middlewares de auth/tenant)
apps/web        React SPA (páginas públicas + área logada)
packages/shared Tipos e schemas Zod compartilhados entre web e api
```

Pontos de entrada úteis:

- `apps/api/src/db/schema.ts` — schema do banco
- `apps/api/src/routes/notes.ts` + `apps/web/src/pages/app/NotesPage.tsx` — padrão CRUD para copiar
- `apps/api/src/middleware/tenant.ts` — isolamento por tenant
- `apps/web/src/App.tsx` — mapa de rotas

## Derivando um produto novo

1. Clone/copie este repo e renomeie (`package.json`, `index.html`, textos "App Base", `render.yaml`)
2. Substitua o recurso `notes` pelo seu domínio: duplique o padrão (schema → `db:generate` → rota → schemas em `packages/shared` → página)
3. Ajuste a landing (`apps/web/src/pages/public/LandingPage.tsx`)
4. Configure `RESEND_API_KEY` e `MAIL_FROM` para e-mails reais
5. Faça deploy: suba o repo no GitHub e crie um Blueprint no Render apontando para o `render.yaml`

## Variáveis de ambiente

Copie `.env.example` para `.env` na raiz (em produção o Render injeta tudo):

| Var                   | Descrição                                                                      |
| --------------------- | ------------------------------------------------------------------------------ |
| `DATABASE_URL`        | Postgres (default aponta para o Docker local)                                  |
| `APP_URL`             | URL pública usada nos links de e-mail (no Render cai no `RENDER_EXTERNAL_URL`) |
| `RESEND_API_KEY`      | Opcional — sem ela, e-mails são logados no console                             |
| `MAIL_FROM`           | Remetente, ex.: `Meu App <no-reply@meuapp.com>`                                |
| `SELF_SIGNUP_ENABLED` | `false` para desligar o cadastro público                                       |

## Scripts

| Comando                                 | Faz                               |
| --------------------------------------- | --------------------------------- |
| `npm run dev`                           | API + web em watch                |
| `npm run build`                         | Build de produção (web)           |
| `npm start`                             | API em produção (serve o SPA)     |
| `npm run db:generate`                   | Gera migration a partir do schema |
| `npm run db:migrate`                    | Aplica migrations                 |
| `npm run db:seed`                       | Usuário demo                      |
| `npm run lint` / `format` / `typecheck` | Qualidade                         |
