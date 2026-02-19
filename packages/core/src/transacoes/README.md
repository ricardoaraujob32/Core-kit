# Módulo: Transações (core) — MVP

## Objetivo
Registrar compras e vendas (confirmadas) e gerar movimentos mínimos de estoque.

## Permissões (RBAC)
- `TRANSACOES_CRIAR` criar transação confirmada

## Regras do domínio (MVP)
- Transação deve possuir ao menos 1 item.
- Quantidade deve ser inteiro positivo.
- Itens SERVICO são permitidos, mas não geram movimento de estoque.
- COMPRA gera ENTRADA; VENDA gera SAIDA.
- Sem triggers: movimentos são gerados no core e persistidos por adapter (Prisma) depois.

## Dependências (portas)
- `RepositorioTransacoes`
- `RepositorioEstoque` (para consultar itens e registrar movimentos)
