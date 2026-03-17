# Módulo Usuarios

## Objetivo

Responsável pela identidade e gestão básica de usuários.

## Natureza

Este é um pacote base.

## Dependências permitidas

- kernel
- transversal
- locatarios

## Dependências proibidas

- tokens
- rbac
- auth
- outros pacotes de domínio não necessários

## Escopo atual

- criar usuário
- obter usuário
- listar usuários por locatário
- atualizar usuário
- inativar usuário
- reativar usuário

## Regras

- usuário nasce com status `ATIVO`
- e-mail é normalizado em minúsculas
- e-mail deve ser único por locatário no conjunto de usuários não excluídos
- usuário inativo, suspenso ou encerrado não é considerado operacionalmente válido no caso de uso de obtenção

## Observação

Este pacote não trata:
- autenticação
- emissão de token
- sessão
- autorização RBAC