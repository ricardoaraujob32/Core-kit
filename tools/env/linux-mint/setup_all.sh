#!/usr/bin/env bash
set -Eeuo pipefail

###############################################################################
# setup_all.sh — Orquestrador de instalação (Mint/Ubuntu-based)
#
# Objetivo:
# - Rodar instalações e configurações "por módulos" e registrar logs
# - Ser robusto: validar sudo, checar scripts, permitir rodar parcialmente
# - Ser fácil de backup (uma pasta só em ~/Scripts/setup-linux)
#
# Como usar:
#   ./setup_all.sh --all
#   ./setup_all.sh --vscode --vscode-ext --node --react
#   DB_PASS='SENHA_FORTE' ./setup_all.sh --postgres --dbeaver
#
# Dica:
#   Rode sempre como usuário "dev".
###############################################################################

# --- Diretórios base (parametrizáveis) ---------------------------------------
BASE_DIR="${BASE_DIR:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)}"

# shellcheck disable=SC1090
source "$BASE_DIR/00-lib.sh"
LOG_DIR="${LOG_DIR:-$BASE_DIR/logs}"
STAMP="$(date +%F_%H%M%S)"
RUN_LOG="$LOG_DIR/run_$STAMP.log"

# --- Comportamento ------------------------------------------------------------
DRY_RUN="${DRY_RUN:-0}"       # 1 = não executa, só mostra o que faria
STOP_ON_FAIL="${STOP_ON_FAIL:-1}"  # 1 = para na primeira falha; 0 = continua
REQUIRE_USER="${REQUIRE_USER:-dev}" # usuário recomendado para executar

# --- Flags padrão (tudo desligado; --all liga o conjunto) ---------------------
DO_FLATPAK=0
DO_GITHUB_DESKTOP=0
DO_PYTHON=0
DO_VSCODE=0
DO_VSCODE_EXT=0
DO_NODE=0
DO_REACT=0
DO_POSTGRES=0
DO_DBEAVER=0

# --- Helpers -----------------------------------------------------------------
log()  { printf "\n\033[1;32m[OK]\033[0m %s\n" "$*" | tee -a "$RUN_LOG"; }
warn() { printf "\n\033[1;33m[WARN]\033[0m %s\n" "$*" | tee -a "$RUN_LOG"; }
err()  { printf "\n\033[1;31m[ERRO]\033[0m %s\n" "$*" | tee -a "$RUN_LOG"; }

die() { err "$*"; exit 1; }

usage() {
  cat <<'EOF'
Uso:
  setup_all.sh [opções]

Opções principais:
  --all                 Executa o pacote completo (recomendado)
  --flatpak             Instala Flatpak + adiciona Flathub
  --github-desktop       Instala GitHub Desktop (via Flatpak)
  --python            Prepara Python (venv + pip)
  --vscode               Instala VSCode (APT, com fallback para Flatpak)
  --vscode-ext           Instala extensões essenciais do VSCode
  --node                 Instala NVM + Node LTS + pnpm (Corepack)
  --react                Cria projeto React com Vite (usa pnpm)
  --postgres             Instala PostgreSQL e configura user/db (exige DB_PASS)
  --dbeaver              Instala DBeaver Community (via Flatpak)

Controles:
  --dry-run              Mostra o que faria, sem executar
  --continue             Continua mesmo se um módulo falhar (padrão: para)
  --help                 Mostra esta ajuda

Variáveis de ambiente úteis:
  DB_PASS='SENHA'        (obrigatória para --postgres)
  DB_USER=dev            (padrão: dev)
  DB_NAME=dev            (padrão: dev)
  PROJECTS_DIR=~/Projetos (padrão: ~/Projetos)
  APP_NAME=meu-app        (padrão: meu-app)
EOF
}

# Executa comando exibindo e logando (com suporte a DRY_RUN)
run_cmd() {
  local cmd=("$@")
  if [[ "$DRY_RUN" == "1" ]]; then
    warn "DRY_RUN: ${cmd[*]}"
    return 0
  fi
  printf "\n$ %s\n" "${cmd[*]}" | tee -a "$RUN_LOG"
  "${cmd[@]}" 2>&1 | tee -a "$RUN_LOG"
}

# Executa um módulo (script) com logging + controle de falha
run_module() {
  local script="$1"
  local label="$2"

  [[ -x "$BASE_DIR/$script" ]] || die "Script não encontrado ou sem permissão: $BASE_DIR/$script"

  log "Iniciando módulo: $label  ($script)"

  if run_cmd "$BASE_DIR/$script"; then
    log "Módulo OK: $label"
  else
    err "Módulo FALHOU: $label"
    if [[ "$STOP_ON_FAIL" == "1" ]]; then
      die "Parando por falha (use --continue para seguir mesmo com erro)."
    else
      warn "Continuando apesar da falha (modo --continue)."
    fi
  fi
}

# Checagens iniciais
preflight() {
  mkdir -p "$LOG_DIR"
  : > "$RUN_LOG"

  log "Log desta execução: $RUN_LOG"
  log "Base dir: $BASE_DIR"

  # Usuário recomendado
  if [[ "$(id -un)" != "$REQUIRE_USER" ]]; then
    warn "Recomendado rodar como '$REQUIRE_USER'. Você está como: $(id -un)"
    warn "Se você estiver no admin, troque: su - dev"
  fi

  # Sudo disponível?
  if ! command -v sudo >/dev/null 2>&1; then
    die "sudo não encontrado. Instale sudo ou ajuste a máquina para permitir."
  fi

  # Teste rápido do sudo (vai pedir senha se necessário)
  if [[ "$DRY_RUN" != "1" ]]; then
    if sudo -n true >/dev/null 2>&1; then
      log "sudo OK (sem prompt)."
    else
      warn "sudo pode pedir senha agora (normal)."
      sudo true
      log "sudo OK."
    fi
  else
    warn "DRY_RUN ativo: pulando validação real do sudo."
  fi

  # Check scripts base obrigatórios
  local required=( "00-lib.sh" )
  for f in "${required[@]}"; do
    [[ -f "$BASE_DIR/$f" ]] || die "Arquivo obrigatório ausente: $BASE_DIR/$f"
  done

  log "Preflight OK."
}

# --- Parse args --------------------------------------------------------------
if [[ $# -eq 0 ]]; then
  usage
  exit 1
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --all)
      DO_FLATPAK=1
      DO_GITHUB_DESKTOP=1
      DO_PYTHON=1
      DO_VSCODE=1
      DO_VSCODE_EXT=1
      DO_NODE=1
      DO_REACT=1
      DO_POSTGRES=1
      DO_DBEAVER=1
      shift
      ;;
    --flatpak) DO_FLATPAK=1; shift ;;
    --github-desktop) DO_GITHUB_DESKTOP=1; shift ;;
    --python) DO_PYTHON=1; shift ;;
    --vscode) DO_VSCODE=1; shift ;;
    --vscode-ext) DO_VSCODE_EXT=1; shift ;;
    --node) DO_NODE=1; shift ;;
    --react) DO_REACT=1; shift ;;
    --postgres) DO_POSTGRES=1; shift ;;
    --dbeaver) DO_DBEAVER=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    --continue) STOP_ON_FAIL=0; shift ;;
    --help|-h) usage; exit 0 ;;
    *)
      die "Opção desconhecida: $1 (use --help)"
      ;;
  esac
done

preflight

# --- Ordem sugerida (com dependências) ---------------------------------------
# 1) Base (flatpak) — necessário p/ GitHub Desktop e DBeaver se via Flatpak
if [[ "$DO_FLATPAK" == "1" ]]; then
  run_module "01-flatpak-flathub.sh" "Flatpak + Flathub"
fi

# 2) GitHub Desktop
if [[ "$DO_GITHUB_DESKTOP" == "1" ]]; then
  run_module "02-github-desktop.sh" "GitHub Desktop"
fi

# 3) Python
if [[ "$DO_PYTHON" == "1" ]]; then
  run_module "03-python-venv.sh" "Python (venv)"
fi

# 4) VSCode
if [[ "$DO_VSCODE" == "1" ]]; then
  run_module "06-vscode.sh" "VSCode"
fi

# 5) Extensões VSCode (depende do VSCode)
if [[ "$DO_VSCODE_EXT" == "1" ]]; then
  run_module "07-vscode-extensions.sh" "Extensões essenciais do VSCode"
fi

# 6) Node/NVM/pnpm
if [[ "$DO_NODE" == "1" ]]; then
  run_module "04-node-nvm-pnpm.sh" "Node (NVM) + pnpm"
fi

# 7) React (depende do pnpm/node)
if [[ "$DO_REACT" == "1" ]]; then
  run_module "05-react-vite-template.sh" "React (Vite + pnpm)"
fi

# 8) PostgreSQL (depende de DB_PASS)
if [[ "$DO_POSTGRES" == "1" ]]; then
  if [[ -z "${DB_PASS:-}" ]]; then
    die "Para --postgres, defina: export DB_PASS='SUA_SENHA_FORTE' (antes de rodar)."
  fi
  run_module "08-postgresql.sh" "PostgreSQL (user/db)"
fi

# 9) DBeaver (útil após Postgres, mas não obrigatório)
if [[ "$DO_DBEAVER" == "1" ]]; then
  # garante base flatpak se não rodou
  if [[ "$DO_FLATPAK" == "0" ]]; then
    warn "DBeaver via Flatpak precisa do Flathub; rodando módulo Flatpak antes."
    run_module "01-flatpak-flathub.sh" "Flatpak + Flathub"
  fi
  run_module "09-dbeaver.sh" "DBeaver"
fi

log "Execução finalizada."
log "Se algo não aparecer no Menu (Flatpak), reinicie a sessão (logout/login)."
log "Abra o log para auditoria: $RUN_LOG"