# Patch recomendado no offlineCreateProcessor

Troque resoluções manuais por:

```ts
import {
  resolveOptionalOfflineDependency,
  resolveRequiredOfflineDependency,
} from "./offlineDependencies";
```

Exemplos:

## Venda

```ts
const clienteId = resolveOptionalOfflineDependency(
  "cliente",
  payload.clienteId,
);
```

## Compra

```ts
const fornecedorId = resolveOptionalOfflineDependency(
  "fornecedor",
  payload.fornecedorId,
);
```

## Item de transação

```ts
const transacaoId = resolveRequiredOfflineDependency(
  "transacao",
  payload.transacaoId,
  "transacaoId",
);

const produtoId = resolveRequiredOfflineDependency(
  "servico",
  payload.produtoId,
  "produtoId",
);
```

Assim, quando uma dependência ainda não tiver ID real, a fila marca como erro de dependência.
