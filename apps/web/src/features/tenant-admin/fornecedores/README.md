# Módulo frontend de fornecedores

Estrutura alinhada ao padrão consolidado do tenant admin:

- `api/fornecedoresApi.ts`
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
- permissões da feature ficam em `hooks/useFornecedoresPermissions.ts`
