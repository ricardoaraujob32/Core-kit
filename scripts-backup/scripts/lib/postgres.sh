#!/usr/bin/env bash
set -Eeuo pipefail

require_postgres_tools() {
  require_command pg_dump
  require_command pg_restore
  require_command psql
}

confirm_dangerous_action() {
  local message="$1"
  local expected="${2:-CONFIRMAR}"

  echo "$message"
  read -r -p "Digite '${expected}' para continuar: " answer

  if [[ "$answer" != "$expected" ]]; then
    echo "Operação cancelada."
    exit 1
  fi
}

assert_not_production_without_force() {
  if [[ "${APP_ENV}" == "production" && "${FORCE_PRODUCTION_RESTORE:-false}" != "true" ]]; then
    echo "Restore bloqueado em produção. Defina FORCE_PRODUCTION_RESTORE=true para liberar." >&2
    exit 2
  fi
}

backup_filename() {
  local prefix="${BACKUP_PREFIX:-mini-saas}"
  echo "${prefix}_$(timestamp_now).dump"
}
