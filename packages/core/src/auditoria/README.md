# Módulo: Auditoria

## Objetivo
Padronizar eventos de auditoria (quem fez o quê, quando, onde, em qual entidade).

## O que armazenar
- locatarioId
- usuarioId (pode ser null para rotinas automatizadas)
- ação (CRIAR, ATUALIZAR, REMOVER, LOGIN, etc.)
- entidade + entidadeId
- antes/depois (quando aplicável)
- metadados: ip, userAgent, correlação (requestId), etc.

## Como é populada (visão hexagonal)
- O core define o formato do evento (domínio).
- Adaptadores (API/infra) decidem como persistir (ex.: tabela audit.* ou fila).
