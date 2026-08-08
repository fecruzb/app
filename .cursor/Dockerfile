FROM node:22-bookworm-slim

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      git \
      curl \
      ca-certificates \
      docker.io \
      docker-compose-v2 \
      fuse-overlayfs \
      iptables \
      sudo \
    && rm -rf /var/lib/apt/lists/*

# Cloud Agents run as ubuntu; allow passwordless sudo for dockerd startup.
RUN groupadd -f docker \
    && usermod -aG docker ubuntu 2>/dev/null || true \
    && echo "ubuntu ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/ubuntu \
    && chmod 0440 /etc/sudoers.d/ubuntu

USER ubuntu
