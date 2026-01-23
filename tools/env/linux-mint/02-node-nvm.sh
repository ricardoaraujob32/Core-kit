#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/00-common.sh"

msg "Instalando/atualizando NVM (Node Version Manager)..."

# Instala NVM se não existir
if [ ! -d "$HOME/.nvm" ]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

# Carrega NVM no shell atual
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1090
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

require_cmd nvm

msg "Instalando Node conforme .nvmrc..."
NODE_VERSION="$(cat "$(git rev-parse --show-toplevel)/.nvmrc")"
nvm install "$NODE_VERSION"
nvm use "$NODE_VERSION"

msg "Node atual: $(node -v)"
msg "npm atual:  $(npm -v)"
msg "OK."
