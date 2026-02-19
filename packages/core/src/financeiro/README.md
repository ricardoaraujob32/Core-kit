# Módulo: Financeiro leve (core) — MVP

## Objetivo
Registrar lançamentos financeiros (contas a pagar/receber) de forma simples e robusta.

## Permissões (RBAC)
- `FINANCEIRO_CRIAR` criar lançamento
- `FINANCEIRO_LISTAR` listar lançamentos
- `FINANCEIRO_QUITAR` quitar lançamento

## Tipos e status
- Tipo: `RECEITA | DESPESA`
- Status: `ABERTO | QUITADO | CANCELADO`

## Origem
- `MANUAL`
- `TRANSACAO` (natureza: `COMPRA | VENDA`) — define tipo automaticamente
- `ORDEM_SERVICO` — por padrão gera `RECEITA` (pode evoluir depois)

## Regras do MVP
- `valorCentavos` é inteiro positivo (evita float).
- `descricao` mínima (>= 3).
- Quitar só quando `status = ABERTO`.
- Sem triggers: mudanças são aplicadas no core e persistidas no adapter (Prisma).
