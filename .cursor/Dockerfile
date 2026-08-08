FROM ubuntu:24.04

# Base tooling + Docker (for the Postgres dev container) in one layer.
# Ubuntu ships the `docker-compose-v2` package (provides `docker compose`);
# Debian does not, which is why this image is Ubuntu-based.
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      git \
      curl \
      ca-certificates \
      gnupg \
      docker.io \
      docker-compose-v2 \
      fuse-overlayfs \
      iptables \
      sudo \
    && rm -rf /var/lib/apt/lists/*

# Node.js 22 from NodeSource (Ubuntu 24.04 ships an older Node in its repos).
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Cloud Agents run as the pre-existing `ubuntu` user (uid 1000). Grant docker
# access and passwordless sudo so the start script can launch dockerd.
RUN groupadd -f docker \
    && usermod -aG docker ubuntu \
    && echo "ubuntu ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/ubuntu \
    && chmod 0440 /etc/sudoers.d/ubuntu

USER ubuntu
