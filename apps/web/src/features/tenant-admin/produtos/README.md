# Módulo frontend de produtos

Estrutura alinhada ao padrão consolidado do tenant admin:

- `api/produtosApi.ts`
- `components/`
- `hooks/`
- `pages/`
- `tipos.ts`
- `produto.viewModel.ts`

## Fluxos cobertos
- listagem
- detalhe
- criação
- edição

## Observações
- erros de UI devem usar `mapError`
- permissões da feature ficam em `hooks/useProdutosPermissions.ts`
