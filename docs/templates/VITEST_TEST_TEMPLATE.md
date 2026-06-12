# VITEST_TEST_TEMPLATE.md

## Nome do teste
- Ex.: criarCliente.test.ts

## Objetivo
Testar o comportamento do usecase como especificação.

## Padrões
- AAA (Arrange, Act, Assert)
- Use fakes/in-memory ports
- Clock injetável

## Casos mínimos recomendados
- sucesso
- validação falha
- sem permissão
- não encontrado (quando aplicável)
- isolamento multi-tenant (quando aplicável)