# Módulo: Estoque (core) — MVP

## Objetivo
Implementar o mínimo de ERP para catálogo e estoque:
- Itens de catálogo: PRODUTO ou SERVICO
- Estoque padrão automático por locatário
- Movimentos mínimos: ENTRADA, SAIDA, AJUSTE

## Permissões (RBAC)
- `ESTOQUE_CRIAR_ITEM` criar item de catálogo
- `ESTOQUE_LER` listar catálogo
- `ESTOQUE_MOVIMENTAR` registrar movimento

## Regras do domínio (MVP)
- Serviços não possuem movimentação.
- Quantidade deve ser inteiro positivo.
- SAIDA não pode deixar saldo negativo.
- AJUSTE define o saldo final do item no estoque (regra simples e útil para correções rápidas).

## Porta e adapter
- `RepositorioEstoque` (porta)
- `criarRepositorioEstoqueEmMemoria` (adapter em memória)

## Notas de evolução
- Múltiplos estoques (filiais/unidades) podem ser adicionados sem quebrar o núcleo (já existe `estoqueId`).
- Futuro: Lote/validade, custos (CMV), reservas, e integração com transações (compra/venda).
