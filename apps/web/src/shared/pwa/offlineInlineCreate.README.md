# Criação offline nos cadastros inline

## Arquivos

- `shared/pwa/createOfflineEntity.ts`
- `shared/pwa/offlineCreateProcessor.ts`
- `shared/pwa/OfflineSyncBootstrap.tsx`
- `clientes/components/InlineClienteForm.tsx`
- `fornecedores/components/InlineFornecedorForm.tsx`
- `produtos/components/InlineServicoForm.tsx`

## Como ativar a sincronização

No layout autenticado, por exemplo `TenantAdminLayout` ou `TenantAdminShell`, adicione:

```tsx
import { OfflineSyncBootstrap } from "../../../shared/pwa/OfflineSyncBootstrap";

export function TenantAdminLayout() {
  return (
    <>
      <OfflineSyncBootstrap />
      {/* resto do layout */}
    </>
  );
}
```

## Comportamento

Offline:

- o cadastro é adicionado ao select imediatamente;
- o nome aparece com `(pendente)`;
- a mutação entra em `corekit:pwa:queue`.

Online:

- o cadastro usa a API normalmente;
- se houver itens pendentes, `OfflineSyncBootstrap` tenta sincronizar.

## Limitação conhecida

O ID temporário não é reconciliado com o ID real do backend nesta etapa.
Para OS/venda vinculada a cliente offline, será necessário um mapa de IDs temporários → IDs reais antes de sincronizar transações complexas.
