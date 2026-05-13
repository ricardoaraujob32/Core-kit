#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/../lib/env.sh"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/../lib/log.sh"

export RUN_PREVENTIVE_RESTORE=true
export AUTO_CONFIRM_AUX_RESTORE="${AUTO_CONFIRM_AUX_RESTORE:-true}"

log_info "Executando backup + restore preventivo no BD auxiliar."

"${SCRIPT_DIR}/backup-db.sh"
