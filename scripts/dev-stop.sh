#!/usr/bin/env bash
set -euo pipefail

# Stop Medusa container if running
if command -v docker >/dev/null 2>&1; then
  docker compose -f infra/docker/docker-compose.yml stop medusa >/dev/null 2>&1 || true
fi

# Kill common dev ports (Next.js:3000, Strapi:1337, Admin dev:7001, Medusa host dev:9000)
ports=(3000 1337 7001 9000)
for port in "${ports[@]}"; do
  if command -v lsof >/dev/null 2>&1; then
    pids=$(lsof -ti tcp:$port || true)
    if [ -n "${pids:-}" ]; then
      kill -9 $pids >/dev/null 2>&1 || true
    fi
  fi
done

exit 0
