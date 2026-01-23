#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/00-common.sh"

msg "Instalando dependências do sistema (git, curl, build tools)..."
sudo apt-get update -y
sudo apt-get install -y \
  git curl ca-certificates \
  build-essential \
  unzip zip \
  jq

msg "OK."
