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
  log_error "Uso: restore-db.sh <arquivo.dump>"
  exit 1
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
  log_error "Arquivo não encontrado: ${BACKUP_FILE}"
  exit 1
fi

assert_not_production_without_force

"${SCRIPT_DIR}/validar-backup.sh" "$BACKUP_FILE"

confirm_dangerous_action \
  "ATENÇÃO: esta operação restaurará o dump no DATABASE_URL configurado. Dados existentes podem ser sobrescritos." \
  "RESTAURAR"

log_info "Iniciando restore em DATABASE_URL."
log_info "Origem: ${BACKUP_FILE}"

pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --dbname="$DATABASE_URL" \
  "$BACKUP_FILE"

log_info "Restore concluído."
