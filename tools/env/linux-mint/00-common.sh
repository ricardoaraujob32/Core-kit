#!/usr/bin/env bash
set -euo pipefail

msg() { echo -e "\n[core-kit] $*\n"; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "[core-kit] ERRO: comando '$1' não encontrado."
    exit 1
  }
}
