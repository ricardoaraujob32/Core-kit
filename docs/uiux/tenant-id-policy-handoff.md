# Handoff — Refatoração UI/UX Tenant sem IDs

## Versão

v1.0

## Objetivo

Remover IDs técnicos da experiência visual do tenant, mantendo IDs onde são necessários tecnicamente.

## Decisão arquitetural

A refatoração não altera backend, banco, contratos HTTP nem rotas.

IDs continuam existindo em:

- URL;
- parâmetros de rota;
- payloads;
- keys de React;
- values de selects;
- ações internas;
- superadmin;
- blocos técnicos ocultos.

A mudança é visual e semântica:

- tenant vê domínio;
- superadmin vê operação.

## Artefatos criados nas etapas

- Etapa 5: regras de campos de exibição tenant.
- Etapa 6: view models tenant.
- Etapa 7: listas tenant.
- Etapa 8: detalhes tenant.
- Etapa 9: selects e labels.
- Etapa 10: helpers de label por domínio.
- Etapa 11: separação tenant × superadmin.
- Etapa 12: breadcrumbs e headers.
- Etapa 13: validação e regressão.
- Etapa 14: fechamento e estabilização.

## Riscos conhecidos

- Imports quebrados em `shared/formatters`.
- Barrel `index.ts` gerando import circular.
- Componentes antigos ainda importando `shortCode`, `formatMoney` ou `formatDate`.
- Páginas tenant antigas ainda exibindo `*Id` diretamente.

## Regra para próximos agentes

Antes de mexer em telas tenant, procurar:

```bash
grep -R "shortCode(" apps/web/src/features/tenant-admin
grep -R "Id}" apps/web/src/features/tenant-admin
grep -R "clienteId\|produtoId\|fornecedorId\|transacaoId\|ordemServicoId" apps/web/src/features/tenant-admin
```

Não trocar rotas por slug nesta fase.
