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

BACKUP_FILE="${BACKUP_DIR}/$(backup_filename)"

log_info "Iniciando backup do banco principal."
log_info "Destino: ${BACKUP_FILE}"

pg_dump \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  --file="$BACKUP_FILE" \
  "$DATABASE_URL"

log_info "Backup gerado com sucesso."
log_info "Arquivo: ${BACKUP_FILE}"

"${SCRIPT_DIR}/validar-backup.sh" "$BACKUP_FILE"

if [[ "${RUN_PREVENTIVE_RESTORE:-false}" == "true" ]]; then
  log_info "RUN_PREVENTIVE_RESTORE=true detectado. Iniciando restore preventivo."
  "${SCRIPT_DIR}/restore-aux-db.sh" "$BACKUP_FILE"
fi
