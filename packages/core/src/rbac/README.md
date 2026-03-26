# Módulo RBAC

## Objetivo

Responsável por resolver papéis, permissões e autorizar operações.

## Natureza

Este é um pacote base especializado.

Ele não autentica — apenas autoriza.

## Dependências permitidas

- kernel
- transversal
- locatarios
- usuarios

## Dependências proibidas

- tokens
- auth
- outros pacotes de domínio

## Escopo

- resolver papéis do usuário
- resolver permissões do usuário
- autorizar operações

## Contrato dos casos de uso

Todos os casos seguem o padrão:

- `XInput`
- `XOutput`
- `XResult`

## Modelo conceitual

RBAC opera sobre:

- `ContextoExecucao` (kernel)
- `usuarioId`
- `locatarioId`

## Enriquecimento de contexto

O RBAC não retorna DTO paralelo.

Ele transforma:

Contexto base → Contexto autorizado

```ts
ContextoExecucao -> ContextoExecucao (enriquecido)