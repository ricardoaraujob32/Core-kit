#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/../lib/env.sh"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/../lib/log.sh"

log_info "Removendo backups com mais de ${BACKUP_RETENTION_DAYS} dia(s)."
log_info "Diretório: ${BACKUP_DIR}"

find "$BACKUP_DIR" \
  -maxdepth 1 \
  -type f \
  -name "*.dump" \
  -mtime "+${BACKUP_RETENTION_DAYS}" \
  -print \
  -delete

log_info "Limpeza concluída."
