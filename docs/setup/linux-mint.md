# Setup do Ambiente (Linux Mint)

Este guia prepara o ambiente local de desenvolvimento do Core Kit (monorepo).
Objetivo: setup reproduzível, sem Docker (por enquanto), com pin de versões.

## Pré-requisitos

- Linux Mint (ou Ubuntu-based)
- Permissão de sudo
- Git instalado (se não, o script instala)

## Visão geral do padrão adotado

- Node via NVM (+ .nvmrc no repositório)
- Python via venv (Python do sistema)
- Postgres: cliente local (psql). Servidor pode ser local ou remoto dependendo do ambiente.
- Scripts versionados em `tools/env/linux-mint/`
- Script "doctor" para validar setup

## Passo a passo (modo recomendado)

1. Rodar dependências do sistema:
   - `tools/env/linux-mint/01-system-deps.sh`
2. Instalar/atualizar Node via NVM:
   - `tools/env/linux-mint/02-node-nvm.sh`
3. Preparar Python (venv + pip atualizado):
   - `tools/env/linux-mint/03-python-venv.sh`
4. Instalar cliente Postgres (psql):
   - `tools/env/linux-mint/04-postgres-client.sh`
5. Instalar dependências do projeto (workspaces):
   - `tools/env/linux-mint/05-project-install.sh`
6. Validar ambiente:
   - `tools/env/linux-mint/99-doctor.sh`

## Variáveis de ambiente

- Nunca commitar `.env` com segredos.
- Use `.env.example` e documente as variáveis por app.
- Em produção/homolog: variáveis ficam no provedor/VM, não no repositório.

## Sem Docker (por enquanto): como manter consistência

- Pin de Node por `.nvmrc`
- Scripts de setup versionados
- CI valida build/typecheck/test
- Ambiente por app (apps/_) e pacotes (packages/_)

## Evolução futura

- Se um dia adotar Docker: manter estes scripts como "modo sem Docker"
- Para homolog/prod: automatizar provisionamento com Ansible/Terraform/cloud-init (sem depender de Docker)
