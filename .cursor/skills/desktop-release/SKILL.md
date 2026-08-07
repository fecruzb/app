---
name: desktop-release
description: Release the App Base desktop apps (Tauri, macOS/Windows/Linux). The canonical path is the GitHub Actions pipeline — bump the version, push a `vX.Y.Z` tag, and CI builds, signs, and publishes the installers + signed auto-update artifacts to the same public R2 bucket used for media (under `desktop-releases/`). Use when the user asks to cut/ship/publish a desktop release or bump the app version. Local build commands are documented as a manual fallback only.
---

# Desktop release (Tauri · macOS / Windows / Linux)

The desktop app (`apps/desktop`) is a thin Tauri shell around `apps/web`. A
release ships per-OS installers **and** signed auto-update artifacts to the
**same** Cloudflare R2 bucket as media (`CLOUDFLARE_MEDIA_BUCKET`), under the
`desktop-releases/` prefix. Installed apps poll
`desktop-releases/latest/latest.json` via `tauri-plugin-updater`.

## Canonical path: cut a release via the pipeline

**Releases are CI-driven.** Three workflows
(`.github/workflows/release-desktop-{macos,windows,linux}.yml`) build · sign ·
publish on hosted runners. Repo secrets hold the same R2 creds as Render media
plus the updater signing key.

Each workflow triggers on `push:` of a tag matching `v[0-9]+.[0-9]+.[0-9]+`
(and `workflow_dispatch`).

**The updater compares the manifest `version` against the installed app's
`tauri.conf.json` version — every release MUST bump the version.** Steps:

1. **Bump the version in BOTH files to the same `X.Y.Z`:**
   - `apps/desktop/package.json` → `version`
   - `apps/desktop/src-tauri/tauri.conf.json` → `version` (updater source of truth)
2. **Commit on `main`** (e.g. `chore(desktop): release vX.Y.Z`) and push.
3. **Tag and push:**
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```
4. Watch the three `Release Desktop …` workflows. Each uploads its installer
   and **merges** its platform entries into
   `desktop-releases/latest/latest.json` (all three scripts merge).
5. Installed apps pick up the new manifest on next launch / poll.

Confirm the version bump with the user before tagging; never re-point an
existing tag.

### What CI produces (per workflow → R2 `desktop-releases/latest/`)

| Workflow          | Runner                                      | Installer key                      | Updater payload                 | Manifest merge                    |
| ----------------- | ------------------------------------------- | ---------------------------------- | ------------------------------- | --------------------------------- |
| macOS (universal) | `macos-15` (+ `x86_64-apple-darwin` target) | `AppBase.dmg` + `install-macos.sh` | `AppBase.app.tar.gz` (+ `.sig`) | `darwin-aarch64`, `darwin-x86_64` |
| Windows (x64)     | `windows-latest`                            | `AppBase-Windows-Setup.exe`        | the `.exe` (+ `.sig`)           | `windows-x86_64`                  |
| Linux (x64)       | `ubuntu-22.04`                              | `AppBase.AppImage`                 | the `.AppImage` (+ `.sig`)      | `linux-x86_64`                    |

### Required repo secrets

Same R2 knobs as media on Render, plus updater signing:

| Secret                                                      | Purpose                                                                       |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `VITE_API_URL`                                              | Production API origin baked into the SPA                                      |
| `TAURI_SIGNING_PRIVATE_KEY`                                 | Updater private key (`tauri signer generate`)                                 |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`                        | Key password (empty string secret if none)                                    |
| `CLOUDFLARE_S3_API`                                         | R2 S3 API endpoint                                                            |
| `CLOUDFLARE_ACCESS_KEY_ID` / `CLOUDFLARE_SECRET_ACCESS_KEY` | Same token as media                                                           |
| `CLOUDFLARE_MEDIA_BUCKET`                                   | Shared bucket (default `app`)                                                 |
| `R2_PUBLIC_BASE_URL`                                        | Public base URL — must match `plugins.updater.endpoints` in `tauri.conf.json` |

Commit the updater **public** key in `apps/desktop/src-tauri/tauri.conf.json`
(`plugins.updater.pubkey`). Never commit the private key.

Generate once:

```bash
npm run tauri -w @app/desktop signer generate -- -w ~/.tauri/app-base-updater.key
```

Paste the printed public key into `tauri.conf.json` and store the private key

- password as the GitHub secrets above. **Back up the private key** — losing
  it means installed apps can no longer verify updates.

Set `plugins.updater.endpoints` to
`${R2_PUBLIC_BASE_URL}/desktop-releases/latest/latest.json`.

## Auto-update

Rust-only (`apps/desktop/src-tauri/src/update.rs`):

- **On launch**: check → download → verify → install → `app.restart()` when newer.
- **Tray → "Check for Updates…"**: same path on demand.
- **Background poll** (~10 min): sets a tray badge; user applies from the tray.

## Manual / local fallback

```bash
npm run release:mac:publish     # universal .dmg + sign + upload
npm run release:win:publish     # Windows (run on Windows)
npm run release:linux:publish   # AppImage (run on Linux)
```

Publish-only (artifact already built): `release:publish`,
`release:win:publish:only`, `release:linux:publish:only`.

Local needs: Rust (+ `rustup target add x86_64-apple-darwin` for universal),
`TAURI_SIGNING_PRIVATE_KEY` (+ password), the same `CLOUDFLARE_*` /
`R2_PUBLIC_BASE_URL` as media (loaded from `apps/api/.env` / `.env`), and
`apps/desktop/.env.production` with `VITE_API_URL` + `VITE_ROUTER=hash`.
