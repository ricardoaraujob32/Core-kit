# Exemplo de uso por feature

## Clientes

```ts
const clientes = useClientesCached();

if (clientes.isLoading) return <>Carregando...</>;

return (
  <>
    {clientes.isFromCache ? (
      <span>Dados em cache desde {clientes.updatedAt}</span>
    ) : null}

    {clientes.error ? <EntityAlert>{clientes.error}</EntityAlert> : null}

    <ClientesTable itens={clientes.data} />
  </>
);
```

## Mutações offline

```ts
const queue = useOfflineMutationQueue(async (item) => {
  switch (item.type) {
    case "clientes.criar":
      await clientesApi.criar(item.payload as CriarClienteInput);
      return;
  }
});

async function criarCliente(input: CriarClienteInput) {
  if (queue.isOffline) {
    queue.enqueue({
      type: "clientes.criar",
      payload: input,
    });
    return;
  }

  await clientesApi.criar(input);
}
```
