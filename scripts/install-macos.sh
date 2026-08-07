#!/usr/bin/env bash
# One-liner installer for the latest macOS .dmg from the public releases bucket.
# BRAND_NAME is maintained by `npm run sync:brand` — do not edit by hand.
set -euo pipefail

BRAND_NAME="App Base"

PUBLIC_BASE="${R2_PUBLIC_BASE_URL:-https://your-r2-public.example}"
PUBLIC_BASE="${PUBLIC_BASE%/}"
DMG_URL="${PUBLIC_BASE}/desktop-releases/latest/AppBase.dmg"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "Downloading ${BRAND_NAME}…"
curl -fsSL "$DMG_URL" -o "$TMP/AppBase.dmg"
echo "Mounting…"
MOUNT="$(hdiutil attach "$TMP/AppBase.dmg" -nobrowse | awk 'END{print $NF}')"
APP="$(find "$MOUNT" -maxdepth 1 -name '*.app' -print -quit)"
if [[ -z "$APP" ]]; then
  echo "No .app found in the DMG" >&2
  exit 1
fi
echo "Installing to /Applications…"
rm -rf "/Applications/$(basename "$APP")"
cp -R "$APP" /Applications/
hdiutil detach "$MOUNT" >/dev/null
echo "Done. Open /Applications/$(basename "$APP")"
