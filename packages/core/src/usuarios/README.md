# Módulo Usuarios

## Objetivo

Responsável pela identidade, ciclo de vida e validade operacional de usuários.

## Natureza

Este é um pacote base.

Ele depende de `locatarios` para escopo multi-tenant.

## Dependências permitidas

- kernel
- transversal
- locatarios

## Dependências proibidas

- tokens
- rbac
- auth
- outros pacotes de domínio

## Escopo

- criar usuário
- obter usuário
- listar usuários por locatário
- atualizar usuário
- inativar usuário
- reativar usuário

## Contrato dos casos de uso

Todos os casos seguem o padrão:

- `XInput`
- `XOutput`
- `XResult`

## Modelo de estado

O usuário é governado por máquina de estados explícita:

Estados possíveis:

- `ATIVO`
- `INATIVO`
- `SUSPENSO`
- `ENCERRADO`

### Transições válidas

| Estado atual | Evento       | Próximo estado |
|-------------|-------------|----------------|
| ATIVO       | INATIVAR    | INATIVO        |
| INATIVO     | ATIVAR      | ATIVO          |
| ATIVO       | SUSPENDER   | SUSPENSO       |
| SUSPENSO    | ATIVAR      | ATIVO          |
| ATIVO       | ENCERRAR    | ENCERRADO      |
| INATIVO     | ENCERRAR    | ENCERRADO      |
| SUSPENSO    | ENCERRAR    | ENCERRADO      |

### Regras

- `ENCERRADO` é terminal
- não existe retorno de `ENCERRADO`
- transições devem passar pela máquina de estados

## Regras de negócio

- usuário nasce com status `ATIVO`
- e-mail é normalizado (lowercase)
- e-mail deve ser único por locatário (considerando não excluídos)

## Regra operacional

Casos como `obterUsuario`:

- devem validar via máquina de estados
- não devem usar `if (status !== ...)` diretamente

## Papel no sistema

- identidade de acesso ao sistema
- base para autenticação (`auth`)
- base para autorização (`rbac`)

## Observações

Este pacote não trata:

- autenticação
- sessão
- emissão de tokens
- autorização RBAC

Ele define apenas:

→ identidade  
→ estado  
→ validade operacional