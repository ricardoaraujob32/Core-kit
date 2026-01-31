#!/usr/bin/env bash
set -Eeuo pipefail

###############################################################################
# 99-doctor.sh — Validação rápida do ambiente e dos scripts do setup_all.sh
#
# Finalidade:
# - Mostrar versões (git/node/python/psql)
# - Ler setup_all.sh e validar:
#   - todos os scripts referenciados existem
#   - todos fazem referência ao 00-lib.sh
#   - todos passam em "bash -n" (syntax check)
###############################################################################

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1090
source "$SCRIPT_DIR/00-lib.sh"

need_cmd bash

ROOT="$SCRIPT_DIR"
if command -v git >/dev/null 2>&1; then
  ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$SCRIPT_DIR")"
fi

log "Rodando Doctor (validação do ambiente)..."
log "Repo root: $ROOT"

echo "- Git:     $(git --version 2>/dev/null || echo '(ausente)')"
echo "- Node:    $(node -v 2>/dev/null || echo '(ausente)')"
echo "- npm:     $(npm -v 2>/dev/null || echo '(ausente)')"
echo "- pnpm:    $(pnpm -v 2>/dev/null || echo '(ausente)')"
echo "- Python3: $(python3 --version 2>/dev/null || echo '(ausente)')"
echo "- psql:    $(psql --version 2>/dev/null || echo '(ausente)')"

SETUP_ALL="$SCRIPT_DIR/setup_all.sh"
if [[ ! -f "$SETUP_ALL" ]]; then
  err "setup_all.sh não encontrado em: $SETUP_ALL"
  exit 1
fi

log "Coletando scripts listados por setup_all.sh..."
mapfile -t SCRIPTS < <(grep -Eo 'run_module\s+"[^"]+\.sh"' "$SETUP_ALL" | sed -E 's/^run_module\s+"([^"]+)"/\1/' | sort -u)

if [[ "${#SCRIPTS[@]}" -eq 0 ]]; then
  warn "Nenhum script encontrado via run_module. Verifique o formato do setup_all.sh."
else
  log "Encontrados ${#SCRIPTS[@]} scripts."
fi

fail=0
for f in "${SCRIPTS[@]}"; do
  path="$SCRIPT_DIR/$f"
  if [[ ! -f "$path" ]]; then
    err "Ausente: $path"
    fail=1
    continue
  fi

  if ! grep -q "00-lib\.sh" "$path"; then
    err "Sem referência a 00-lib.sh: $f"
    fail=1
  fi

  if ! bash -n "$path" >/dev/null 2>&1; then
    err "Falha em 'bash -n' (sintaxe): $f"
    fail=1
  fi
done

if [[ "$fail" -eq 1 ]]; then
  err "Doctor encontrou problemas. Corrija e rode novamente."
  exit 1
fi

log "Doctor OK: todos os scripts do setup_all.sh existem e passaram nos testes."