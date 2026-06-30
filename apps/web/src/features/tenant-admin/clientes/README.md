# Módulo frontend de clientes

Estrutura alinhada ao padrão consolidado do tenant admin:

- `api/clientesApi.ts`
- `components/`
- `hooks/`
- `pages/`
- `tipos.ts`

## Fluxos cobertos
- listagem
- detalhe
- criação
- edição

## Observações
- erros de UI devem usar `mapError`
- permissões da feature ficam em `hooks/useClientesPermissions.ts`
