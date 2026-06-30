# Módulo frontend de transações

Estrutura alinhada ao padrão consolidado do tenant admin:

- `api/transacoesApi.ts`
- `components/`
- `hooks/`
- `pages/`
- `tipos.ts`
- `transacao.viewModel.ts`

## Fluxos cobertos
- listagem
- detalhe
- criação de venda
- criação de compra
- manutenção de itens
- confirmação e cancelamento

## Observações
- erros de UI devem usar `mapError`
- permissões da feature ficam em `hooks/useTransacoesPermissions.ts`
