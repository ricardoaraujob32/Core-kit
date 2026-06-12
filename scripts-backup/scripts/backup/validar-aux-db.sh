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

log_info "Validando BD auxiliar restaurado."

psql "$RESTORE_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT current_database() AS database_restaurado;
SELECT COUNT(*) AS schemas_visiveis
FROM information_schema.schemata;
SQL

log_info "Validação básica do BD auxiliar concluída."
