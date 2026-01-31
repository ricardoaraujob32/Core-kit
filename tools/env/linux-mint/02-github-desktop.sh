#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/00-lib.sh"

APP_ID="${GHD_APP_ID:-io.github.shiftkey.Desktop}"
REMOTE="${FLATPAK_REMOTE:-flathub}"

log "Instalando GitHub Desktop via Flatpak ($APP_ID)..."

need_cmd flatpak || { err "flatpak não encontrado. Rode antes: 01-flatpak-flathub.sh"; exit 1; }

# Instala
if flatpak info "$APP_ID" >/dev/null 2>&1; then
  log "GitHub Desktop já instalado."
else
  flatpak install -y "$REMOTE" "$APP_ID"
  log "GitHub Desktop instalado."
fi

# Execução (opcional): descomente se quiser abrir automaticamente
# flatpak run "$APP_ID" &

log "Pronto. Se não aparecer no menu, reinicie a sessão (logout/login)."

