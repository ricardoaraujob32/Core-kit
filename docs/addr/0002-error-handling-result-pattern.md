# docs/adr/0002-error-handling-result-pattern.md

## Status
Aceito

## Contexto
Em um core modular e multi-tenant, falhas esperadas (ex.: sem permissão, não encontrado, validação) são comuns.
Usar exceptions como fluxo normal:
- dificulta testes
- reduz previsibilidade
- aumenta acoplamento com adapters/frameworks

## Decisão
Usecases retornam `Result<T, AppError>` (ou equivalente), onde:
- `Ok(value)` representa sucesso
- `Err(appError)` representa falha esperada e tratável

Exceptions ficam reservadas a:
- bugs
- invariantes quebradas inesperadamente
- falhas de infraestrutura não tratadas (que devem ser mapeadas em adapter quando possível)

## Consequências

### Positivas
- controle explícito do fluxo de erro
- testes mais simples e previsíveis
- adapters mapeiam erro → HTTP de forma consistente
- reduz “try/catch espalhado”

### Negativas
- mais verbosidade em alguns fluxos
- exige disciplina para não misturar padrões

## Padrões sugeridos
- catálogo central de `AppErrorCode`
- helpers:
  - `ok(value)`
  - `err(code, message, details?)`
- mapeamento padronizado no adapter HTTP