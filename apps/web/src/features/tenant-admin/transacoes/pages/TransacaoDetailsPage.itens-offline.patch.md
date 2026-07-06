# Patch para `TransacaoDetailsPage.tsx`

Este patch é textual para evitar sobrescrever a versão atual da sua tela.

## 1. Importar hook

```ts
import { useTransacaoItensPwa } from "../hooks/useTransacaoItensPwa";
import type { TransacaoItem } from "../tipos";
```

Se `TransacaoItem` já estiver importado, não duplique.

## 2. Criar handlers locais

Dentro do componente:

```ts
function adicionarItemLocal(item: TransacaoItem) {
  setTransacao((current) =>
    current
      ? {
          ...current,
          itens: [item, ...current.itens],
        }
      : current,
  );
}

function atualizarItemLocal(
  itemTransacaoId: string,
  input: AtualizarItemTransacaoInput,
) {
  setTransacao((current) =>
    current
      ? {
          ...current,
          itens: current.itens.map((item) =>
            item.itemTransacaoId === itemTransacaoId
              ? {
                  ...item,
                  ...input,
                  valorSubtotal:
                    Number(input.quantidade ?? item.quantidade) *
                    Number(input.valorUnitario ?? item.valorUnitario),
                  valorDesconto: Number(
                    input.valorDesconto ?? item.valorDesconto,
                  ),
                  valorTotal: Math.max(
                    Number(input.quantidade ?? item.quantidade) *
                      Number(input.valorUnitario ?? item.valorUnitario) -
                      Number(input.valorDesconto ?? item.valorDesconto),
                    0,
                  ),
                }
              : item,
          ),
        }
      : current,
  );
}

function removerItemLocal(itemTransacaoId: string) {
  setTransacao((current) =>
    current
      ? {
          ...current,
          itens: current.itens.filter(
            (item) => item.itemTransacaoId !== itemTransacaoId,
          ),
        }
      : current,
  );
}
```

## 3. Instanciar hook

Depois de `transacaoId` estar disponível:

```ts
const itensPwa = useTransacaoItensPwa({
  transacaoId: transacaoId ?? "",
  onLocalItemAdded: adicionarItemLocal,
  onLocalItemUpdated: atualizarItemLocal,
  onLocalItemRemoved: removerItemLocal,
  reload: carregar,
});
```

## 4. Trocar funções

Onde hoje chama:

```ts
await transacoesApi.adicionarItem(...)
await transacoesApi.atualizarItem(...)
await transacoesApi.removerItem(...)
```

troque por:

```ts
await itensPwa.adicionar(novoItem)
await itensPwa.atualizar(itemId, input)
await itensPwa.remover(itemId)
```

## 5. Exibir alerta offline

Na seção de itens:

```tsx
{itensPwa.isOffline ? (
  <EntityAlert>
    Você está offline. Alterações nos itens serão sincronizadas depois.
  </EntityAlert>
) : null}

{itensPwa.error ? <EntityAlert>{itensPwa.error}</EntityAlert> : null}
```

## 6. Estado de execução

Você pode manter `isRunning` atual ou usar:

```ts
const isRunningItens = itensPwa.isRunning !== null;
```
