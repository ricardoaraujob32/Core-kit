# Módulo Locatarios

## Objetivo

Responsável pela identidade, ciclo de vida e validação operacional de locatários.

## Natureza

Este é um pacote base fundamental.

Ele define uma das entidades raiz do sistema multi-tenant.

## Dependências permitidas

- kernel
- transversal

## Dependências proibidas

- usuarios
- tokens
- rbac
- auth
- outros pacotes de domínio

## Escopo

- criar locatário
- obter locatário
- listar locatários

## Contrato dos casos de uso

Todos os casos seguem o padrão:

- `XInput`
- `XOutput`
- `XResult`

## Modelo de estado

O locatário é governado por uma máquina de estados explícita:

Estados possíveis:

- `ATIVO`
- `SUSPENSO`
- `ENCERRADO`

### Transições válidas

| Estado atual | Evento      | Próximo estado |
|-------------|------------|----------------|
| ATIVO       | SUSPENDER  | SUSPENSO       |
| SUSPENSO    | ATIVAR     | ATIVO          |
| ATIVO       | ENCERRAR   | ENCERRADO      |
| SUSPENSO    | ENCERRAR   | ENCERRADO      |

### Regras de consistência

- `ENCERRADO` é estado terminal
- não há transição a partir de `ENCERRADO`
- máquina de estados deve ser a única fonte de verdade de transição

## Regras de negócio

- locatário nasce com status `ATIVO`
- locatário `SUSPENSO` não é operacionalmente válido
- locatário `ENCERRADO` não é operacionalmente válido

## Regra operacional (importante)

Casos de uso como `obterLocatario`:

- DEVEM passar pela máquina de estados
- NÃO devem validar status manualmente

## Papel no sistema

- raiz de isolamento multi-tenant
- boundary de segurança lógica
- referência obrigatória para usuários e tokens

## Observações

Este pacote não trata:

- autenticação
- sessão
- autorização
- emissão de tokens

Ele apenas define **identidade + estado + validade operacional**.