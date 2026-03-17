# Módulo RBAC

## Objetivo

Responsável pela resolução de papéis e permissões e pela autorização de operações.

## Natureza

Este é um pacote base especializado.

## Dependências permitidas

- kernel
- transversal
- locatarios
- usuarios

## Dependências proibidas

- tokens
- auth
- outros pacotes de domínio não necessários

## Escopo atual

- resolver permissões do usuário
- resolver papéis do usuário
- autorizar operação com base no contexto

## Regras

- RBAC depende de usuário autenticado
- permissões devem ser resolvidas por locatário e usuário
- autorização não depende de sessão/token
- contexto enriquecido com permissões e papéis deve permanecer imutável no sentido lógico

## Observação

Este pacote não trata:
- login
- senha
- emissão de token
- sessão
- autenticação completa