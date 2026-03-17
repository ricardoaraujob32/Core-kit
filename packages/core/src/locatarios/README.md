# Módulo Locatarios

## Objetivo

Responsável pela identidade e consulta básica de locatários.

## Natureza

Este é um pacote base fundamental.

## Dependências permitidas

- kernel
- transversal

## Dependências proibidas

- usuarios
- tokens
- rbac
- auth
- outros pacotes de domínio

## Escopo atual

- criar locatário
- obter locatário
- listar locatários

## Regras

- locatário nasce com status `ATIVO`
- locatário `SUSPENSO` não pode ser obtido como válido para uso operacional
- locatário `ENCERRADO` não pode ser obtido como válido para uso operacional

## Observação

Este pacote não trata:
- autenticação
- sessão
- autorização
- emissão de token