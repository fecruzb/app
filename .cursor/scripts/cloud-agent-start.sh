#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

"$(dirname "${BASH_SOURCE[0]}")/ensure-docker.sh"

npm run db:up

for _ in $(seq 1 60); do
  if docker compose exec -T postgres pg_isready -U app -d app_base >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! docker compose exec -T postgres pg_isready -U app -d app_base >/dev/null 2>&1; then
  echo "Postgres did not become ready in time" >&2
  exit 1
fi

npm run db:migrate
npm run db:seed
