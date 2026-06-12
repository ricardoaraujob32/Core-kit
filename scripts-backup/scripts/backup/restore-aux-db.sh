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

: "${RESTORE_DATABASE_URL:?RESTORE_DATABASE_URL não definido. Informe a URL do BD auxiliar em .env.backup}"

BACKUP_FILE="${1:-}"

if [[ -z "$BACKUP_FILE" ]]; then
  log_error "Uso: restore-aux-db.sh <arquivo.dump>"
  exit 1
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
  log_error "Arquivo não encontrado: ${BACKUP_FILE}"
  exit 1
fi

"${SCRIPT_DIR}/validar-backup.sh" "$BACKUP_FILE"

log_warn "O BD auxiliar será limpo antes do restore."
log_warn "Destino auxiliar: RESTORE_DATABASE_URL"

if [[ "${AUTO_CONFIRM_AUX_RESTORE:-false}" != "true" ]]; then
  confirm_dangerous_action \
    "Confirme o restore preventivo no BD auxiliar." \
    "RESTAURAR_AUX"
fi

log_info "Limpando schema public do BD auxiliar."

psql "$RESTORE_DATABASE_URL" <<'SQL'
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
SQL

log_info "Restaurando backup no BD auxiliar."
log_info "Origem: ${BACKUP_FILE}"

pg_restore \
  --no-owner \
  --no-privileges \
  --dbname="$RESTORE_DATABASE_URL" \
  "$BACKUP_FILE"

log_info "Restore preventivo no BD auxiliar concluído."

if [[ "${RUN_AUX_VALIDATION:-true}" == "true" ]]; then
  "${SCRIPT_DIR}/validar-aux-db.sh"
fi
