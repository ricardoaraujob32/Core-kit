#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=00-lib.sh
source "$SCRIPT_DIR/00-lib.sh"

FLATHUB_REMOTE="${FLATHUB_REMOTE:-flathub}"
FLATHUB_URL="${FLATHUB_URL:-https://flathub.org/repo/flathub.flatpakrepo}"

log "SO detectado: $(read_os_release)"

need_cmd sudo

if ! command -v flatpak >/dev/null 2>&1; then
  log "Instalando flatpak..."
  as_root apt update
  as_root apt install -y flatpak
else
  log "flatpak já instalado."
fi

# Adiciona o Flathub (idempotente)
if flatpak remotes | awk '{print $1}' | grep -qx "$FLATHUB_REMOTE"; then
  log "Remote '$FLATHUB_REMOTE' já existe."
else
  log "Adicionando Flathub..."
  # Se der erro de rede, falha claramente
  as_root flatpak remote-add --if-not-exists "$FLATHUB_REMOTE" "$FLATHUB_URL"
fi

log "Flatpak/Flathub OK. (Talvez precise reiniciar sessão para aparecer no menu.)"

