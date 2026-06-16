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

command -v pg_dump >/dev/null 2>&1 || {
  echo "Erro: pg_dump não encontrado."
  echo "Instale com: sudo apt install postgresql-client"
  exit 1
}

mkdir -p backups

DATA="$(date +"%Y-%m-%d_%H-%M-%S")"
ARQUIVO="backups/corekit-${DATA}.backup"

/usr/lib/postgresql/17/bin/pg_dump \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="$ARQUIVO" \
  "$DATABASE_URL"

echo "Backup criado:"
ls -lh "$ARQUIVO"