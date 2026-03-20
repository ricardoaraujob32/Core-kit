# Módulo Assinaturas

## Objetivo

Responsável pelo ciclo de vida de assinaturas do locatário e pela habilitação de módulos associados à assinatura.

## Escopo

Este módulo concentra duas responsabilidades que antes poderiam estar separadas:

1. gestão da assinatura do locatário
2. vínculo de módulos habilitados pela assinatura

Não existe pacote `modulos_assinatura`.
Essa decisão foi tomada para simplificar o Core no contexto de monólito modular.

## Responsabilidades

- criar assinatura
- ativar assinatura
- suspender assinatura
- cancelar assinatura
- vincular módulo à assinatura
- desvincular módulo da assinatura
- listar módulos habilitados do locatário

## Regras

### 1. assinatura por locatário
Um locatário não pode possuir mais de uma assinatura operacional ao mesmo tempo
(status: `RASCUNHO`, `ATIVA` ou `SUSPENSA`).

### 2. plano válido
Não é permitido criar assinatura para plano inexistente ou inativo.

### 3. módulo válido
Não é permitido vincular à assinatura um módulo inexistente ou inativo.

### 4. módulos grátis
Módulos gratuitos são resolvidos em conjunto com os módulos da assinatura.

### 5. monetização não substitui autorização
Ter módulo habilitado não substitui RBAC/permissões.
A autorização final continua sendo:

- tenant válido
- módulo habilitado
- permissão RBAC
- regra de negócio

## Fluxo esperado

JWT
→ ContextoExecucao
→ RBAC
→ resolução de módulos habilitados
→ usecase de negócio

## Integração esperada com BD

Tabelas esperadas no schema v15:

- `assinaturas`
- `modulos`
- `modulos_assinatura` ou equivalente físico no banco

Observação:
mesmo que a tabela física continue com nome relacional específico,
o Core mantém tudo encapsulado no pacote `assinaturas`.

## Erros importantes

- `ASSINATURA_INVALIDA`
- `ASSINATURA_NAO_ENCONTRADA`
- `ASSINATURA_ATIVA_JA_EXISTE`
- `ASSINATURA_TRANSICAO_STATUS_INVALIDA`
- `PLANO_INVALIDO`
- `MODULO_INVALIDO`
- `MODULO_ASSINATURA_JA_VINCULADO`
- `MODULO_ASSINATURA_NAO_VINCULADO`