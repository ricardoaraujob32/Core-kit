# docs/adr/0003-multi-tenant-scope-and-context.md

## Status
Aceito

## Contexto
O Core Kit é multi-tenant. Precisamos garantir:
- isolamento de dados entre locatários
- auditoria e rastreabilidade
- prevenção de ataques por “tenant injection” (cliente forjando locatário)

## Decisão
1. `locatarioId` é **obrigatório** no `ContextoExecucao`.
2. O `locatarioId` vem de fonte confiável:
   - token/claims
   - subdomínio/roteamento
   - header confiável (somente em ambientes controlados)
3. Repositórios/queries devem sempre filtrar por `locatarioId`.
4. Não aceitar `locatarioId` do body como autoridade.

## Consequências

### Positivas
- isolamento garantido por padrão
- padrão único para todas as operações
- melhora observabilidade e logs

### Negativas
- exige disciplina e revisão constante de queries
- pode exigir índices/chaves compostas e padronização de schemas

## Regras práticas
- todo método de repo recebe `locatarioId` (direto ou via ctx)
- logs e auditoria sempre incluem `locatarioId` e `usuarioId` (se houver)
- controllers nunca “inventam” locatário: apenas constroem ctx