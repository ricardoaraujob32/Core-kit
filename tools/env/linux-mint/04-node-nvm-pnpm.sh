#!/usr/bin/env bash
set -Eeuo pipefail

###############################################################################
# 04-node-nvm-pnpm.sh — Node.js (via NVM) + pnpm (via Corepack)
#
# Finalidade:
# - Instalar/atualizar NVM
# - Instalar Node (prioridade: .nvmrc na raiz do repo)
# - Ativar Corepack e preparar pnpm
#
# Variáveis (opcionais):
#   NVM_DIR="$HOME/.nvm"
#   NVM_VERSION="v0.39.7"
#   NODE_CHANNEL="--lts"          (se não houver .nvmrc)
#   PNPM_VERSION="latest"
#   INSTALL_BUILD_DEPS=1          (instala deps via apt)
###############################################################################

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1090
source "$SCRIPT_DIR/00-lib.sh"

on_error() {
  local exit_code=$?
  err "Falha na linha ${BASH_LINENO[0]} ao executar: ${BASH_COMMAND} (exit ${exit_code})"
  exit "$exit_code"
}
trap on_error ERR

need_cmd curl

NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
NVM_VERSION="${NVM_VERSION:-v0.39.7}"
NVM_INSTALL_URL="${NVM_INSTALL_URL:-https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh}"

NODE_CHANNEL="${NODE_CHANNEL:---lts}"          # Ex.: --lts, 22, 20
PNPM_VERSION="${PNPM_VERSION:-latest}"         # Ex.: latest, 9.12.3
INSTALL_BUILD_DEPS="${INSTALL_BUILD_DEPS:-1}"

if [[ "$INSTALL_BUILD_DEPS" == "1" ]] && command -v apt >/dev/null 2>&1; then
  log "Instalando dependências (apt) necessárias..."
  as_root apt update
  as_root apt install -y --no-install-recommends build-essential ca-certificates curl git
fi

if [[ -d "$NVM_DIR" ]]; then
  log "NVM já existe em: $NVM_DIR"
else
  log "Instalando NVM (${NVM_VERSION})..."
  curl -fsSL "$NVM_INSTALL_URL" | bash
fi

export NVM_DIR="$NVM_DIR"
# shellcheck disable=SC1090
[[ -s "$NVM_DIR/nvm.sh" ]] && . "$NVM_DIR/nvm.sh"

need_cmd nvm

NODE_TARGET="$NODE_CHANNEL"
if command -v git >/dev/null 2>&1; then
  if git_root="$(git rev-parse --show-toplevel 2>/dev/null)"; then
    if [[ -f "$git_root/.nvmrc" ]]; then
      nvmrc="$(tr -d ' \t\r' < "$git_root/.nvmrc" | sed '/^$/d' | head -n 1 || true)"
      if [[ -n "${nvmrc:-}" ]]; then
        NODE_TARGET="$nvmrc"
        log "Encontrado .nvmrc -> Node alvo: $NODE_TARGET"
      fi
    fi
  fi
fi

log "Instalando Node ($NODE_TARGET)..."
nvm install "$NODE_TARGET"
nvm use "$NODE_TARGET" >/dev/null
nvm alias default "$NODE_TARGET" >/dev/null 2>&1 || true

if command -v corepack >/dev/null 2>&1; then
  log "Ativando Corepack..."
  corepack enable
  log "Ativando pnpm@${PNPM_VERSION}..."
  corepack prepare "pnpm@${PNPM_VERSION}" --activate
else
  warn "corepack não encontrado. Instalando pnpm via npm (fallback)..."
  need_cmd npm
  as_root npm i -g "pnpm@${PNPM_VERSION}"
fi

log "Versões:"
log "node: $(node -v)"
log "npm:  $(npm -v)"
log "pnpm: $(pnpm -v 2>/dev/null || echo '(pnpm ausente)')"
log "OK."