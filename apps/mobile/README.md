# @app/mobile (Tauri iOS shell)

Thin packaging shell around `apps/web`. Same remote-API model as desktop:
`VITE_API_URL` + `VITE_ROUTER=hash`. Product UI stays in `apps/web`.

There is **no App Store / TestFlight CI in v1** — signing and Apple team IDs
are product-specific. Use Xcode locally.

## Prerequisites

- macOS with Xcode (and iOS Simulator or a device)
- [Rust](https://rustup.rs/) + `npm install` at the repo root
- Tauri iOS tooling: first time run `npm run ios:init -w @app/mobile` (generates
  `src-tauri/gen/apple/`, gitignored)
- API with `CORS_ORIGIN` including `http://localhost:1422`, `tauri://localhost`,
  and `https://tauri.localhost` (see root `.env.example`)

## Local run

1. Start the API (`npm run dev` or at least the API on `:5000`).
2. For the **simulator**, `VITE_API_URL=http://localhost:5000` in
   `.env.development` is usually enough.
3. For a **physical device**, the phone cannot reach `localhost` on your Mac —
   set `VITE_API_URL` to your Mac's LAN IP (e.g. `http://192.168.x.x:5000`) or
   a deployed API, and ensure that origin is in `CORS_ORIGIN`.
4. Open the Xcode project / run:

```bash
npm run dev:mobile                 # Vite on :1422 + iOS dev
# or
npm run ios:open -w @app/mobile    # open in Xcode after ios:init
npm run ios:build -w @app/mobile   # release-style local build
```

In Xcode: select your **Team** (Signing & Capabilities) for
`com.appbase.mobile` (rename the identifier in `tauri.conf.json` for a real
product).

## Branding

Rename `productName` / `identifier` in `src-tauri/tauri.conf.json` and the
npm package name when forking the template.
