# Módulo Auth

## Objetivo

Responsável pela autenticação e pela composição do contexto autenticado/autorizado.

## Natureza

Este é um pacote orquestrador.

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

## Regras

- autenticação depende de locatário válido
- autenticação depende de usuário válido
- emissão de sessão depende de comparação de senha
- sessão autenticada é enriquecida por RBAC
- refresh válido gera nova sessão e revoga o refresh anterior

## Observação

Este pacote não é base.
Ele existe para orquestrar pacotes base sem inflar:
- usuarios
- tokens
- rbac