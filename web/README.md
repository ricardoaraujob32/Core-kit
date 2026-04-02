# Frontend inicial da alfa

## Estrutura adotada

- `src/app`: bootstrap, router e providers
- `src/core`: autenticação, cliente HTTP, erros e guards reutilizáveis
- `src/features`: módulos por domínio/feature
- `src/layouts`: cascas de navegação por contexto
- `src/pages`: páginas globais

## Primeiras áreas cobertas

- Login
- Dashboard de superadmin
- Dashboard de admin do locatário
- Página de acesso negado

## Observação importante

Os códigos em `src/core/types/permissions.ts` devem ser alinhados ao catálogo canônico do backend assim que `permissoes.ts` for compartilhado com o frontend.
