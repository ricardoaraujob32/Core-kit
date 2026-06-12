#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

ENV_FILE="${ENV_FILE:-${PROJECT_ROOT}/.env.backup}"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a
  source "$ENV_FILE"
  set +a
fi

: "${DATABASE_URL:?DATABASE_URL não definido. Informe no ambiente ou em .env.backup}"
: "${BACKUP_DIR:=${PROJECT_ROOT}/backups}"
: "${BACKUP_RETENTION_DAYS:=7}"
: "${APP_ENV:=development}"

mkdir -p "$BACKUP_DIR"

timestamp_now() {
  date +"%Y-%m-%d_%H-%M-%S"
}

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Comando obrigatório não encontrado: $cmd" >&2
    exit 127
  fi
}
