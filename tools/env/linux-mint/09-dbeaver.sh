#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/00-lib.sh"

APP_ID="${DBEAVER_APP_ID:-org.jkiss.dbeaver-community}"
REMOTE="${FLATPAK_REMOTE:-flathub}"

need_cmd flatpak || { err "flatpak não encontrado. Rode antes: 01-flatpak-flathub.sh"; exit 1; }

log "Instalando DBeaver Community via Flatpak ($APP_ID)..."
if flatpak info "$APP_ID" >/dev/null 2>&1; then
  log "DBeaver já instalado."
else
  flatpak install -y "$REMOTE" "$APP_ID"
  log "DBeaver instalado."
fi

log "Dica: para PostgreSQL local, use host 127.0.0.1, porta 5432, user dev, db dev."

