
# Módulo frontend de usuários

Estrutura criada seguindo o padrão atual do frontend:

- `api/usuariosApi.ts`
- `components/`
- `hooks/`
- `pages/`
- `types.ts`

## Fluxos cobertos
- listagem
- detalhe
- criação
- edição
- inativação
- reativação

## Observações
- o backend atual ainda expõe `senhaHash` no DTO; esta implementação não usa esse campo
- ideal alinhar também o catálogo de status do backend antes de consolidar a UI
