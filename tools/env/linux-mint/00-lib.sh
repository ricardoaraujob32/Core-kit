#!/usr/bin/env bash
set -Eeuo pipefail

log()  { printf "\n\033[1;32m[OK]\033[0m %s\n" "$*"; }
warn() { printf "\n\033[1;33m[WARN]\033[0m %s\n" "$*"; }
err()  { printf "\n\033[1;31m[ERRO]\033[0m %s\n" "$*"; }

need_cmd() { command -v "$1" >/dev/null 2>&1 || { err "Comando não encontrado: $1"; return 1; }; }

# Executa com sudo (e falha com mensagem útil)
as_root() {
  if sudo -n true >/dev/null 2>&1; then
    sudo "$@"
  else
    warn "Vai pedir senha do sudo agora..."
    sudo "$@"
  fi
}

# Detecta distro/versão (Linux Mint é Ubuntu-based; no seu caso: Mint 22.2 / Ubuntu noble)
read_os_release() {
  if [[ -r /etc/os-release ]]; then
    # shellcheck disable=SC1091
    . /etc/os-release
    echo "${PRETTY_NAME:-unknown}"
  else
    echo "unknown"
  fi
}

