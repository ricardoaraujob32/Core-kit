#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/00-common.sh"

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

msg "Rodando Doctor (validação do ambiente)..."

echo "Repo root: $ROOT"

echo "- Git:   $(git --version || true)"
echo "- Node:  $(node -v || true)"
echo "- npm:   $(npm -v || true)"
echo "- Python3: $(python3 --version || true)"
echo "- psql:  $(psql --version || true)"

if [ -f ".nvmrc" ]; then
  echo "- .nvmrc: $(cat .nvmrc)"
else
  echo "- .nvmrc: (não encontrado)"
fi

if [ -d ".venv" ]; then
  echo "- venv: OK (.venv existe)"
else
  echo "- venv: AUSENTE (.venv não existe)"
fi

msg "Doctor finalizado."
