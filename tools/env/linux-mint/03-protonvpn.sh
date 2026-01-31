#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/00-lib.sh"

# Pacote do app (GUI GTK) — foi o que apareceu no seu apt
PKG_APP="${PROTON_PKG_APP:-proton-vpn-gtk-app}"

# URL do "repo package" (o .deb que adiciona a origem APT).
# Dica: se o Proton mudar o nome/versão, você só troca aqui.
REPO_DEB_URL="${PROTON_REPO_DEB_URL:-https://repo.protonvpn.com/debian/dists/stable/main/binary-all/protonvpn-stable-release_1.0.0_all.deb}"
REPO_DEB_FILE="/tmp/protonvpn-stable-release.deb"

log "SO detectado: $(read_os_release)"
need_cmd sudo
need_cmd wget

as_root apt update
as_root apt install -y wget gnupg

# 1) Baixa e instala o pacote do repositório
log "Baixando pacote do repositório do ProtonVPN..."
wget -O "$REPO_DEB_FILE" "$REPO_DEB_URL"

log "Instalando pacote do repositório (pode atualizar chaves/apt source)..."
as_root apt install -y "$REPO_DEB_FILE" || {
  warn "Falhou com apt install do .deb. Tentando dpkg + apt -f..."
  as_root dpkg -i "$REPO_DEB_FILE" || true
  as_root apt -f install -y
}

# 2) Atualiza índice e instala o app
log "Atualizando listas e instalando $PKG_APP..."
as_root apt update
as_root apt install -y "$PKG_APP" || {
  err "Falha ao instalar $PKG_APP."
  err "Se isso acontecer, pode ser mirror/bloqueio do provedor. Tente novamente mais tarde."
  exit 1
}

log "ProtonVPN instalado. Agora você pode abrir o app e logar."
log "Obs.: o login fica no app; o GNOME Keyring ('Senhas e Chaves') pode guardar tokens/senhas dependendo do app."

