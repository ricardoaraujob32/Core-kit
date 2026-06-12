#!/usr/bin/env bash
set -Eeuo pipefail

###############################################################################
# 03-python-venv.sh — Python + venv local (.venv) para o monorepo
#
# Finalidade:
# - Instalar Python3 + venv + pip (APT)
# - Criar um ambiente virtual local em .venv na raiz do repositório
# - Atualizar pip dentro do venv
#
# Variáveis (opcionais):
#   VENV_DIR=".venv"
###############################################################################

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1090
source "$SCRIPT_DIR/00-lib.sh"

VENV_DIR="${VENV_DIR:-.venv}"

need_cmd git

log "Preparando Python (venv + pip atualizado)..."
as_root apt-get update -y
as_root apt-get install -y python3 python3-venv python3-pip

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

if [[ ! -d "$VENV_DIR" ]]; then
  log "Criando venv local em $VENV_DIR..."
  python3 -m venv "$VENV_DIR"
else
  log "venv já existe: $VENV_DIR"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"
python -m pip install --upgrade pip

log "Python: $(python --version)"
log "pip:    $(pip --version)"
log "OK."