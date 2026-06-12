#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/../lib/env.sh"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/../lib/log.sh"

log_info "Backups em: ${BACKUP_DIR}"

if ! compgen -G "${BACKUP_DIR}/*.dump" >/dev/null; then
  log_warn "Nenhum backup .dump encontrado."
  exit 0
fi

find "$BACKUP_DIR" -maxdepth 1 -type f -name "*.dump" -printf "%TY-%Tm-%Td %TH:%TM  %s bytes  %p\n" | sort -r
