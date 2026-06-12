#!/usr/bin/env bash
set -Eeuo pipefail

###############################################################################
# 08-postgresql.sh — Instala e prepara PostgreSQL (local, sem Docker)
#
# Finalidade:
# - Instalar PostgreSQL (APT) se necessário
# - Garantir serviço ativo
# - Criar ROLE/usuário da aplicação + DATABASE + (opcional) SCHEMA
# - Ajustar pg_hba.conf para autenticação segura em localhost
#
# Variáveis (env):
#   USUARIO_BANCO="dev"            (alias: DB_USER, APP_ROLE)
#   SENHA_BANCO="senha_forte"      (alias: DB_PASS, APP_PASSWORD)
#   NOME_BANCO="dev"               (alias: DB_NAME, DATABASE_NAME)
#   NOME_ESQUEMA=""                (alias: SCHEMA_NAME)  # vazio = não cria
#   PERMITIR_REMOTO="nao"          (alias: ALLOW_REMOTE) # "sim" para abrir 0.0.0.0/0 (não recomendado)
#   VERSAO_POSTGRES=""             (alias: POSTGRES_VERSION) # auto-detect
#
# Uso:
#   SENHA_BANCO='SUA_SENHA' ./08-postgresql.sh
###############################################################################

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1090
source "$SCRIPT_DIR/00-lib.sh"

USUARIO_BANCO="${USUARIO_BANCO:-${DB_USER:-${APP_ROLE:-dev}}}"
SENHA_BANCO="${SENHA_BANCO:-${DB_PASS:-${APP_PASSWORD:-}}}"
NOME_BANCO="${NOME_BANCO:-${DB_NAME:-${DATABASE_NAME:-dev}}}"
NOME_ESQUEMA="${NOME_ESQUEMA:-${SCHEMA_NAME:-}}"
PERMITIR_REMOTO="${PERMITIR_REMOTO:-${ALLOW_REMOTE:-nao}}"
VERSAO_POSTGRES="${VERSAO_POSTGRES:-${POSTGRES_VERSION:-}}"

need_cmd sudo

if [[ -z "$SENHA_BANCO" ]]; then
  err "Defina a senha antes: export SENHA_BANCO='SUA_SENHA_FORTE' (ou DB_PASS/APP_PASSWORD)"
  exit 1
fi

log "Instalando/validando PostgreSQL..."
if ! command -v psql >/dev/null 2>&1; then
  as_root apt update
  as_root apt install -y postgresql postgresql-contrib
else
  log "psql detectado. PostgreSQL aparentemente instalado."
fi

log "Garantindo que o serviço PostgreSQL está ativo..."
as_root systemctl enable --now postgresql

PG_VERSION="$VERSAO_POSTGRES"
if [[ -z "$PG_VERSION" ]]; then
  PG_VERSION="$(ls -1 /etc/postgresql 2>/dev/null | sort -V | tail -n 1 || true)"
fi
if [[ -z "$PG_VERSION" ]]; then
  err "Não consegui detectar /etc/postgresql/<versao>. Verifique instalação."
  exit 1
fi

PG_HBA="/etc/postgresql/${PG_VERSION}/main/pg_hba.conf"
PG_CONF="/etc/postgresql/${PG_VERSION}/main/postgresql.conf"

log "Versão do PostgreSQL detectada: $PG_VERSION"
log "pg_hba.conf: $PG_HBA"
log "postgresql.conf: $PG_CONF"

log "Criando/atualizando role '$USUARIO_BANCO'..."
as_root sudo -u postgres psql -v ON_ERROR_STOP=1 -tAc "DO \$\$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='${USUARIO_BANCO}') THEN
    CREATE ROLE ${USUARIO_BANCO} LOGIN CREATEDB;
  END IF;
END \$\$;"

as_root sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER ROLE ${USUARIO_BANCO} WITH PASSWORD '${SENHA_BANCO}';"

log "Criando database '$NOME_BANCO' (se não existir) com owner '$USUARIO_BANCO'..."
as_root sudo -u postgres psql -v ON_ERROR_STOP=1 -tAc "SELECT 1 FROM pg_database WHERE datname='${NOME_BANCO}';" | grep -q 1 ||   as_root sudo -u postgres createdb -O "$USUARIO_BANCO" "$NOME_BANCO"

if [[ -n "$NOME_ESQUEMA" ]]; then
  log "Criando schema '$NOME_ESQUEMA' (se não existir) no DB '$NOME_BANCO'..."
  as_root sudo -u postgres psql -v ON_ERROR_STOP=1 -d "$NOME_BANCO" -c "CREATE SCHEMA IF NOT EXISTS ${NOME_ESQUEMA} AUTHORIZATION ${USUARIO_BANCO};"
fi

log "Ajustando pg_hba.conf para localhost com scram-sha-256 (idempotente)..."
as_root cp -n "$PG_HBA" "${PG_HBA}.bak" || true

ensure_hba_line() {
  local line="$1"
  if ! as_root grep -Fqx "$line" "$PG_HBA"; then
    echo "$line" | as_root tee -a "$PG_HBA" >/dev/null
  fi
}

ensure_hba_line "host    all             all             127.0.0.1/32            scram-sha-256"
ensure_hba_line "host    all             all             ::1/128                 scram-sha-256"

if [[ "$PERMITIR_REMOTO" == "sim" || "$PERMITIR_REMOTO" == "yes" ]]; then
  warn "PERMITIR_REMOTO=sim -> habilitando listen_addresses='*' (não recomendado)."
  as_root sed -i "s/^#\?listen_addresses\s*=.*/listen_addresses = '*'/" "$PG_CONF"
  ensure_hba_line "host    all             all             0.0.0.0/0               scram-sha-256"
else
  as_root sed -i "s/^#\?listen_addresses\s*=.*/listen_addresses = 'localhost'/" "$PG_CONF"
fi

log "Reiniciando PostgreSQL para aplicar mudanças..."
as_root systemctl restart postgresql

log "PostgreSQL pronto."
log "  Usuário:   $USUARIO_BANCO"
log "  Database:  $NOME_BANCO"
log "  Schema:    ${NOME_ESQUEMA:-'(não criado)'}"