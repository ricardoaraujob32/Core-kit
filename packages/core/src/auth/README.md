# Módulo Auth

## Objetivo

Responsável pela autenticação e pela composição do contexto autenticado/autorizado.

## Natureza

Este é um pacote orquestrador.

Ele existe para coordenar módulos base já especializados, sem absorver as regras internas desses módulos.

## Dependências permitidas

- kernel
- transversal
- locatarios
- usuarios
- tokens
- rbac

## Dependências proibidas

- SQL
- Prisma
- HTTP
- app
- outros detalhes de infraestrutura

## Escopo atual

- emitir sessão
- validar sessão
- rotacionar refresh
- resolver contexto autorizado

## Contrato dos casos de uso

Cada caso de uso segue o padrão:

- `XInput`
- `XOutput`
- `XResult`

Casos atuais:

- `EmitirSessaoInput`, `EmitirSessaoOutput`, `EmitirSessaoResult`
- `ValidarSessaoInput`, `ValidarSessaoOutput`, `ValidarSessaoResult`
- `RotacionarRefreshInput`, `RotacionarRefreshOutput`, `RotacionarRefreshResult`
- `ResolverContextoAutorizadoInput`, `ResolverContextoAutorizadoOutput`, `ResolverContextoAutorizadoResult`

## Papel arquitetural

`auth` não é fonte de verdade de usuários, tokens ou permissões.

Ele orquestra:

- `locatarios` para validar escopo do login
- `usuarios` para localizar o usuário e validar estado
- `tokens` para criar e rotacionar refresh tokens
- `rbac` para enriquecer o contexto autenticado com papéis e permissões

## Contexto autorizado

O contexto autorizado canônico do sistema é o `ContextoExecucao` do kernel.

O fluxo de autenticação:

1. valida a sessão
2. cria contexto base com `locatarioId` e `usuarioId`
3. delega ao RBAC a resolução de permissões
4. devolve o contexto enriquecido

## Regras

- autenticação depende de locatário válido
- autenticação depende de usuário válido
- emissão de sessão depende de comparação de senha
- sessão autenticada é enriquecida por RBAC
- refresh válido gera nova sessão e revoga o refresh anterior

## Transações

A rotação de refresh token possui trecho persistente atômico:

1. cria novo refresh
2. revoga refresh anterior

Esse trecho deve permanecer dentro de `executarEmTransacao(...)`.

## Observação

Este pacote não é base.
Ele existe para orquestrar pacotes base sem inflar:

- usuarios
- tokens
- rbac