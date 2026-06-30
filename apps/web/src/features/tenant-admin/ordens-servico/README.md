# Módulo frontend de ordens de serviço

Estrutura alinhada ao padrão consolidado do tenant admin:

- `api/ordensServicoApi.ts`
- `components/`
- `hooks/`
- `pages/`
- `tipos.ts`
- `ordemServico.viewModel.ts`

## Fluxos cobertos
- listagem
- detalhe
- criação
- mudança de status
- geração de venda

## Observações
- erros de UI devem usar `mapError`
- permissões da feature ficam em `hooks/useOrdensServicoPermissions.ts`
