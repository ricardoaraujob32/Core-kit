#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/00-common.sh"

msg "Preparando Python (venv + pip atualizado)..."
sudo apt-get update -y
sudo apt-get install -y python3 python3-venv python3-pip

msg "Criando venv local em .venv (raiz do repo), se não existir..."
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

# shellcheck disable=SC1091
source .venv/bin/activate
python -m pip install --upgrade pip

msg "Python: $(python --version)"
msg "pip:    $(pip --version)"
msg "OK."
