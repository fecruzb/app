# @app/desktop (Tauri shell)

Thin packaging shell around `apps/web`. Talks to a remote API via
`VITE_API_URL` + `VITE_ROUTER=hash`. No product UI here — keep features in
`apps/web`.

```bash
# from repo root, with API on :5050 and CORS_ORIGIN set
npm run dev:desktop
```

Local API: prefer `http://localhost:5050` (macOS AirPlay often owns `:5000`).
WKWebView does not persist Secure cookies against HTTP, so shells use the
`sessionToken` from login + `Authorization: Bearer` (see `apps/web/src/lib/session-token.ts`).
Production builds should point `VITE_API_URL` at the HTTPS Render URL.

Production env: copy `.env.production.example` → `.env.production`.

Releases: see [desktop-release skill](../../.cursor/skills/desktop-release/SKILL.md).
Rename `productName` / `identifier` in `src-tauri/tauri.conf.json` when forking.
