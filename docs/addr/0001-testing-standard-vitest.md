# docs/adr/0001-testing-standard-vitest.md

## Status
Aceito

## Contexto
Precisamos de um padrão único para testes automatizados no Core Kit, visando:
- velocidade (execução local)
- integração com TypeScript
- boa DX (watch mode, snapshots quando útil)
- suporte a TDD

## Decisão
Adotar **Vitest** como padrão de testes.

## Consequências

### Positivas
- execução rápida e integração natural com projetos TS/Node
- API familiar (Jest-like)
- watch mode excelente para TDD

### Negativas
- alguns plugins/ecossistemas podem assumir Jest por padrão
- padronização requer ajustes em docs e exemplos do projeto

## Regras práticas
- testes de domínio/usecase devem ser a maioria (rápidos e determinísticos)
- integração (DB/HTTP) somente quando necessário
- `Clock` injetável para evitar flakiness em datas