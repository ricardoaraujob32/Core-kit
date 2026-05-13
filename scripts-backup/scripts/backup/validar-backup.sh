#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/../lib/env.sh"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/../lib/log.sh"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/../lib/postgres.sh"

require_postgres_tools

BACKUP_FILE="${1:-}"

if [[ -z "$BACKUP_FILE" ]]; then
  log_error "Uso: validar-backup.sh <arquivo.dump>"
  exit 1
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
  log_error "Arquivo não encontrado: ${BACKUP_FILE}"
  exit 1
fi

if [[ ! -s "$BACKUP_FILE" ]]; then
  log_error "Arquivo de backup está vazio: ${BACKUP_FILE}"
  exit 1
fi

log_info "Validando leitura do dump: ${BACKUP_FILE}"

pg_restore --list "$BACKUP_FILE" >/dev/null

log_info "Backup válido para leitura via pg_restore."
