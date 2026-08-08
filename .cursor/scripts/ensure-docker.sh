#!/usr/bin/env bash
set -euo pipefail

if docker info >/dev/null 2>&1; then
  exit 0
fi

sudo mkdir -p /etc/docker
if [ ! -f /etc/docker/daemon.json ]; then
  printf '%s\n' '{' '  "storage-driver": "fuse-overlayfs"' '}' | sudo tee /etc/docker/daemon.json >/dev/null
fi

if ! pgrep -x dockerd >/dev/null 2>&1; then
  sudo dockerd --iptables=false >/tmp/dockerd.log 2>&1 &
  for _ in $(seq 1 60); do
    if [ -S /var/run/docker.sock ]; then
      sudo chmod 666 /var/run/docker.sock
      break
    fi
    sleep 1
  done
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon failed to start. Recent dockerd log:" >&2
  tail -20 /tmp/dockerd.log >&2 || true
  exit 1
fi
