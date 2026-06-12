# USECASE_TEMPLATE.md

## Nome do usecase
- Ex.: CriarCliente

## Objetivo
Descrever o comportamento em 1–2 frases.

## Permissões necessárias
- Ex.: clientes.criar

## Entradas (InputDTO)
Listar campos e validações de formato (não regras profundas do domínio).

## Saídas (OutputDTO)
Listar formato de sucesso.

## Regras de negócio
- Regra 1
- Regra 2
- Edge case A
- Edge case B

## Erros possíveis (AppErrorCode)
- EX.: SEM_PERMISSAO
- EX.: VALIDACAO_INVALIDA
- EX.: CLIENTE_NAO_ENCONTRADO

## Dependências (Ports)
- Ex.: ClienteRepo
- Ex.: Clock
- Ex.: IdGenerator

## Observações de multi-tenant
- Toda operação deve usar ctx.locatarioId

## Observações de auditoria (se aplicável)
- Logar: locatarioId, usuarioId, action

## Checklist de testes (TDD)
- deve_...
- deve_...
- deve_...