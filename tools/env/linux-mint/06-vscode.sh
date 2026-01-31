#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/00-lib.sh"

INSTALL_METHOD="${VSCODE_METHOD:-auto}"   # auto | apt | flatpak
FLATPAK_APP_ID="${VSCODE_FLATPAK_ID:-com.visualstudio.code}"
REMOTE="${FLATPAK_REMOTE:-flathub}"

log "SO detectado: $(read_os_release)"

if command -v code >/dev/null 2>&1; then
  log "VSCode já instalado (comando 'code' encontrado)."
  exit 0
fi

as_root apt update
as_root apt install -y ca-certificates curl gpg

try_apt() {
  log "Tentando instalar VSCode via APT (Microsoft repo)..."

  as_root install -d -m 0755 /etc/apt/keyrings

  # Chave GPG (formato keyring)
  curl -fsSL "https://packages.microsoft.com/keys/microsoft.asc" | \
    gpg --dearmor | as_root tee /etc/apt/keyrings/microsoft.gpg >/dev/null

  as_root chmod 0644 /etc/apt/keyrings/microsoft.gpg

  # Repo
  echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | \
    as_root tee /etc/apt/sources.list.d/vscode.list >/dev/null

  as_root apt update
  as_root apt install -y code
}

try_flatpak() {
  log "Tentando instalar VSCode via Flatpak (fallback)..."
  need_cmd flatpak || { err "flatpak não encontrado. Rode: 01-flatpak-flathub.sh"; return 1; }
  flatpak install -y "$REMOTE" "$FLATPAK_APP_ID"
}

case "$INSTALL_METHOD" in
  apt)     try_apt ;;
  flatpak) try_flatpak ;;
  auto)
    try_apt || { warn "APT falhou, usando Flatpak..."; try_flatpak; }
    ;;
  *) err "VSCODE_METHOD inválido: $INSTALL_METHOD"; exit 1 ;;
esac

log "VSCode instalado. Teste com: code --version"

