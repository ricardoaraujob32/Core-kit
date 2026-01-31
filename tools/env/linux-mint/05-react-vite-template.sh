#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/00-lib.sh"

PROJECTS_DIR="${PROJECTS_DIR:-$HOME/Projetos}"
APP_NAME="${APP_NAME:-meu-app}"
TEMPLATE="${TEMPLATE:-react}"
HOST_FLAG="${HOST_FLAG:---host}"  # pra acessar via rede local, se quiser

need_cmd pnpm

mkdir -p "$PROJECTS_DIR"
cd "$PROJECTS_DIR"

if [[ -d "$APP_NAME" ]]; then
  warn "Pasta já existe: $PROJECTS_DIR/$APP_NAME (não vou sobrescrever)."
  exit 0
fi

log "Criando projeto Vite: $APP_NAME (template: $TEMPLATE)"
pnpm create vite@latest "$APP_NAME" --template "$TEMPLATE"

cd "$APP_NAME"
log "Instalando dependências..."
pnpm install

log "Rodando dev server..."
pnpm dev $HOST_FLAG

