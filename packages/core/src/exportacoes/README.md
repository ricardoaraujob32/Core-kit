# Módulo Exportações

## Objetivo

Responsável pelos jobs de exportação do locatário.

## Escopo

- solicitar exportação
- listar exportações do locatário
- marcar exportação em execução
- marcar exportação concluída
- marcar exportação com falha

## Regras

- toda exportação pertence a um locatário
- o job nasce em `PENDENTE`
- `PENDENTE -> EM_EXECUCAO -> CONCLUIDO`
- `PENDENTE -> FALHOU`
- `EM_EXECUCAO -> FALHOU`

## Observações

A geração física do arquivo não pertence ao Core.
O Core modela apenas estado, intenção e transições do job.