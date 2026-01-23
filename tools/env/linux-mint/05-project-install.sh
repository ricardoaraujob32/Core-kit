#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/00-common.sh"

msg "Instalando dependências do monorepo (npm workspaces)..."
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

require_cmd node
require_cmd npm

npm install

msg "OK."
