# Módulo Modulos

## Objetivo

Responsável pela resolução de módulos habilitados por locatário.

Este módulo representa a camada de:

→ feature flags  
→ habilitação por plano  
→ controle de disponibilidade funcional  

## Natureza

Este é um pacote base especializado.

## Dependências permitidas

- kernel
- transversal
- locatarios

## Dependências proibidas

- usuarios
- tokens
- rbac
- auth

## Escopo

- listar módulos habilitados
- verificar habilitação de módulo
- exigir habilitação de módulo

## Contrato dos casos de uso

Todos os casos seguem o padrão:

- `XInput`
- `XOutput`
- `XResult`

## Modelo conceitual

O módulo opera sobre:

- `locatarioId`
- `ModuloCodigo`

E retorna:

- disponibilidade (boolean)
- origem da habilitação

## Origens possíveis

- `SISTEMA` → habilitação nativa
- `PLANO` → via assinatura
- `MANUAL` → override administrativo

## Tipos de operação

### 1. Consulta
- `listarModulosHabilitados`
- `moduloEstaHabilitado`

### 2. Enforcement
- `exigirModuloHabilitado`

## Regra de uso (importante)

- validação → `moduloEstaHabilitado`
- bloqueio → `exigirModuloHabilitado`

Nunca misturar responsabilidade.

## Papel no sistema

- base para controle de features
- integração direta com assinaturas
- usado por auth, serviços e regras de domínio

## Observações

Este pacote não trata:

- autenticação
- autorização RBAC
- sessão
- tokens

Ele apenas define:

→ disponibilidade funcional