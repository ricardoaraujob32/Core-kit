# Módulo Tokens

## Objetivo

Responsável pela persistência e ciclo de vida de tokens.

## Natureza

Este é um pacote base especializado.

## Dependências permitidas

- kernel
- transversal
- locatarios
- usuarios

## Dependências proibidas

- rbac
- auth
- outros pacotes de domínio não necessários

## Escopo atual

- emitir token persistido
- obter token por hash
- listar tokens do usuário
- revogar token
- rotacionar token

## Regras

- hash de token deve ser único
- token revogado não é operacionalmente válido
- token expirado não é operacionalmente válido
- rotação revoga o token anterior e cria um novo
- o token anterior aponta para o próximo token

## Observação

Este pacote não trata:
- autenticação
- senha
- login
- RBAC
- emissão JWT como fluxo de autenticação completa