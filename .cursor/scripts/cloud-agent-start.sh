#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

"$(dirname "${BASH_SOURCE[0]}")/ensure-docker.sh"

npm run db:up

for _ in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U app -d app_base >/dev/null 2>&1; then
    exit 0
  fi
  sleep 1
done

echo "Postgres did not become ready in time" >&2
exit 1
