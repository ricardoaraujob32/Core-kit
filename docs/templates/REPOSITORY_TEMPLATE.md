# REPOSITORY_TEMPLATE.md

## Nome do repositório
- Ex.: ClienteRepo

## Responsabilidade
Descrever o que persiste e recupera.

## Escopo multi-tenant
- Obrigatório filtrar por locatarioId

## Contratos dos métodos

### findById(locatarioId, id)
- Retorna: entidade ou null
- Nunca lança para "não encontrado"

### save(locatarioId, entity)
- Upsert ou insert (definir)

### list(locatarioId, filter?)
- Definir filtros e paginação

## Consistência e índices
- Índices recomendados por locatarioId

## Erros
- Erros técnicos viram AppError no adapter (quando aplicável)

## Testes
- In-memory repo deve reproduzir contrato real