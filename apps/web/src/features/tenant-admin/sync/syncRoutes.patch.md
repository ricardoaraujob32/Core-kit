# Patch de rota para central de sincronização

Adicione uma rota para:

```txt
/app/sincronizacao
```

Exemplo:

```tsx
{
  path: "sincronizacao",
  element: <SyncCenterPage />,
}
```

E importe:

```ts
import SyncCenterPage from "../features/tenant-admin/sync/pages/SyncCenterPage";
```

## Menu

Adicione no menu do tenant:

```ts
{
  label: "Sincronização",
  to: "/app/sincronizacao",
  icon: "🔄",
}
```
