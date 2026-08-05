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
- **Agente + MCP**: botão flutuante no app abre um chat com um assistente (OpenAI) que executa as tools do MCP no contexto do tenant. As mesmas tools ficam disponíveis para o Cursor via stdio (`npm run mcp`, já registrado em `.cursor/mcp.json`)
- **Flag `SELF_SIGNUP_ENABLED`**: desligue para operar só por convite

## Estrutura

A API é organizada por **domínio**: cada domínio agrupa seu schema de banco, repositório (todo o SQL), regras de negócio, um arquivo por endpoint e as tools do agente.

```
apps/api/src/
├── app.ts                # monta o Hono (middlewares + rotas + SPA + health/config) — "a API"
├── server.ts             # entrypoint HTTP: sobe o servidor
├── context.ts            # contexto tipado do request (user/tenant/membership das middlewares)
├── agent/                # superfície do agente (não é domínio): assistant (policy), registry,
│                         # mcp-server, tool (contrato), mcp (entry stdio), endpoints/, routes
├── lib/                  # utilidades puras (sem dependência de nada do app): env (validado
│                         # no boot), crypto, logger, erros, layout de email
├── integrations/         # wrappers de serviços externos: openai (cliente + loop de tools), resend
├── domains/
│   ├── auth/             # schema, repository, service, dto, emails, middleware, endpoints/, routes
│   ├── account/          # endpoints/ (perfil, senha), routes
│   ├── tenant/           # tenants + membros + convites: schema, repository, service,
│   │                     # emails, middleware, endpoints/, tools/, routes
│   └── note/             # recurso de exemplo: schema, repository, dto, endpoints/, tools/, routes
└── db/                   # client, schema.ts (barrel p/ drizzle-kit), columns (auditoria), seed

apps/web                  # React SPA (páginas públicas + área logada)
packages/shared           # schemas Zod e DTOs por domínio (auth, tenant, note, agent)
```

Convenções:

- **Um endpoint por arquivo** em `domains/<dominio>/endpoints/`, nomeado `<acao>.endpoint.ts` (ex.: `create-note.endpoint.ts`); o `routes.ts` do domínio é só o mapa método + path + middlewares.
- **Uma tool por arquivo** em `domains/<dominio>/tools/`, nomeada `<acao>.tool.ts` (ex.: `create-note.tool.ts`); a tool se auto-descreve (`summarize` marca escrita e vira chip na UI do chat). Registre o array do domínio em `agent/registry.ts`.
- **Tools são neutras de transporte**: retornam dados JSON-serializáveis e lançam `Error` para falha esperada. Quem traduz para MCP é `agent/mcp-server.ts`; quem traduz para o loop da OpenAI é `agent/assistant.ts`. Domínios nunca importam MCP/OpenAI (o lint barra).
- **Sufixo no nome = papel do arquivo.** Arquivos de papel único do domínio mantêm o nome do papel (`repository.ts`, `service.ts`, `schema.ts`, `routes.ts`); os de ação (vários por domínio) levam o sufixo `.endpoint.ts` / `.tool.ts`.
- **Repositório concentra o SQL** — endpoints e services não escrevem queries. Toda query de recurso filtra por `tenantId`.
- **Service só quando há regra de negócio real** (sessões, tokens, convites…). CRUD puro chama o repository direto do endpoint/tool — é por isso que `note` não tem `service.ts` e `auth`/`tenant` têm. Quando a operação ganhar regra, crie o service e passe endpoint e tool a chamá-lo.
- **Isolamento por tenant é seguro por padrão** — o `routes.ts` de cada domínio sob tenant aplica `requireAuth`/`requireTenant` uma vez (via `.use`), então toda rota nova já nasce isolada.
- **Tabela nova?** Exporte o schema do domínio em `db/schema.ts` (barrel que o drizzle-kit lê) e rode `db:generate`.
- **Env é validado no boot** (`lib/env.ts`, Zod): variável obrigatória faltando derruba o processo com mensagem clara em vez de quebrar numa query. Adicione novas vars nesse schema.
- **Imports com alias `@/`** (→ `apps/api/src/`): tudo que cruza fronteira usa alias — `@/lib/*`, `@/integrations/*`, `@/db/*`, `@/domains/<outro>/*`. Só imports dentro do próprio domínio ficam relativos (`./repository`, `../service`). Assim mover arquivos não quebra imports e o `../../../` some.
- **Fronteiras são garantidas por lint** (`.oxlintrc.json`, `no-restricted-imports`): `lib/` não pode depender de nada do app; `integrations/` só de `lib/`; domínios só conhecem o contrato do agente (`@/agent/tool`) e nunca MCP/OpenAI direto. Se cruzar a linha, o `npm run lint` acusa.
- **O agente é uma superfície própria** (`agent/`), não um domínio: ele _consome_ os domínios via `registry.ts` (que junta as `tools/` de cada domínio). Tem duas camadas: a _policy_ (`agent/assistant.ts` — quem é o agente e como age) e a _mecânica_ (`integrations/openai.ts` — cliente da OpenAI + o loop de tool-calling). As tools do registry são chamadas direto no request; o `agent/mcp-server.ts` + `agent/mcp.ts` só entram no modo stdio (Cursor).

Pontos de entrada úteis:

- `apps/api/src/app.ts` — todas as rotas montadas num lugar só
- `apps/api/src/domains/note/` + `apps/web/src/pages/app/NotesPage.tsx` — domínio completo para copiar
- `apps/api/src/domains/tenant/middleware.ts` — isolamento por tenant
- `apps/api/src/agent/registry.ts` — tools disponíveis para o agente e o MCP
- `apps/web/src/App.tsx` — mapa de rotas do SPA

## Derivando um produto novo

1. Clone/copie este repo e renomeie (`package.json`, `index.html`, textos "App Base", `render.yaml`)
2. Substitua o recurso `notes` pelo seu domínio: copie `apps/api/src/domains/note/` (schema → repository → endpoints → tools), exporte o schema em `db/schema.ts`, rode `db:generate`, adicione os schemas em `packages/shared` e a página no web
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
| `OPENAI_API_KEY`      | Opcional — sem ela o agente fica desabilitado                                  |
| `ASSISTANT_MODEL`     | Modelo do agente (default `gpt-4o-mini`)                                       |
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
