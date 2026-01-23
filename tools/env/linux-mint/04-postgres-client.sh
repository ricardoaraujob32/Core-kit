#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/00-common.sh"

msg "Instalando cliente Postgres (psql)..."
sudo apt-get update -y
sudo apt-get install -y postgresql-client

msg "psql: $(psql --version)"
msg "OK."
