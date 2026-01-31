#!/usr/bin/env bash
set -Eeuo pipefail

# Lista enxuta e sólida:
# - GitHub: autenticação/PRs
# - JS/TS: lint/format
# - React: snippets
# - Python: extensão oficial + lint/format modernos
EXTENSIONS=(
  "GitHub.vscode-pull-request-github"
  "eamodio.gitlens"
  "esbenp.prettier-vscode"
  "dbaeumer.vscode-eslint"
  "dsznajder.es7-react-js-snippets"
  "ms-python.python"
  "ms-python.vscode-pylance"
  "ms-azuretools.vscode-docker"
)

if ! command -v code >/dev/null 2>&1; then
  echo "[ERRO] VSCode ('code') não encontrado. Instale primeiro."
  exit 1
fi

echo "[OK] Instalando extensões..."
for ext in "${EXTENSIONS[@]}"; do
  echo " - $ext"
  code --install-extension "$ext" || true
done

echo "[OK] Extensões instaladas."

