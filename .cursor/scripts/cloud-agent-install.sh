#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

npm ci

if [ ! -f .env ]; then
  cp .env.example .env
  printf '\nSEED_DEMO_PASSWORD=DemoPass123!\n' >> .env
fi
