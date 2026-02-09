# Infra (no Core)

## Objetivo
Este diretório só deve existir no core se você mantiver "infra compartilhável" que não depende de frameworks.

## Recomendações
- Preferir que repositórios concretos (Prisma, SQL, etc.) fiquem fora do core, no app (adaptadores).
- No core, manter apenas contratos (interfaces) e fábricas puras (ex.: memória para testes).
