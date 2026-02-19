# Módulo: Ordens de Serviço (core) — MVP

## Objetivo
Criar e acompanhar Ordens de Serviço, registrando:
- Itens de serviço (não movimentam estoque)
- Produtos consumidos (movimentam estoque via SAIDA)

## Permissões (RBAC)
- `OS_ABRIR` abrir OS
- `OS_EDITAR` adicionar itens/consumos
- `OS_CONCLUIR` concluir OS

## Regras do domínio (MVP)
- OS nasce em `ABERTA`
- Pode ser alterada em `ABERTA` e `EM_EXECUCAO`
- Conclusão muda para `CONCLUIDA`
- Produto consumido exige que o item seja `PRODUTO` e gera `SAIDA` no estoque
- Sem triggers: movimentos são gerados pelo core

## Dependências
- `RepositorioOrdensServico`
- `RepositorioEstoque` (apenas para consumo de produtos)
