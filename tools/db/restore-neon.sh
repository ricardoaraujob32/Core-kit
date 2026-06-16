#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

if [ -f ".env.backup" ]; then
  set -a
  source ".env.backup"
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Erro: DATABASE_URL não definida."
  echo "Crie .env.backup com:"
  echo 'DATABASE_URL="postgresql://..."'
  exit 1
fi

command -v pg_restore >/dev/null 2>&1 || {
  echo "Erro: pg_restore não encontrado."
  echo "Instale com: sudo apt install postgresql-client"
  exit 1
}

if [ $# -ne 1 ]; then
  echo "Uso:"
  echo "./tools/db/restore-neon.sh backups/arquivo.backup"
  exit 1
fi

ARQUIVO="$1"

if [ ! -f "$ARQUIVO" ]; then
  echo "Erro: arquivo não encontrado: $ARQUIVO"
  exit 1
fi

echo "ATENÇÃO: isso restaurará o banco definido em DATABASE_URL."
read -rp "Continuar? (s/N): " CONFIRMA

if [[ ! "$CONFIRMA" =~ ^[sS]$ ]]; then
  echo "Cancelado."
  exit 0
fi

/usr/lib/postgresql/17/bin/pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --dbname="$DATABASE_URL" \
  "$ARQUIVO"

echo "Restore concluído."