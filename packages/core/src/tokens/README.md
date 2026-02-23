# tokens (core)

Módulo de **refresh tokens** (rotação e revogação).

## Objetivo
- Persistir **somente o hash** do token (nunca o token em claro).
- Permitir **revogação** explícita.
- Permitir **rotação** (token antigo aponta para o novo via `proximoTokenId`).

## Estrutura
- `tipos.ts`: entidades e helpers (`Token`, `criarToken`, etc.)
- `portasRepositorio.ts`: interface do repositório (Clean Architecture)
- `repositorioMemoria.ts`: implementação em memória
- `usecases/`:
  - `revogarToken.ts`
  - `rotacionarToken.ts`
- `erros.ts`: erros específicos do módulo (baseados em `ErroApp`)

## Regras de negócio (atuais)
- `revogarToken`: se já revogado -> `CONFLITO`.
- `rotacionarToken`:
  - token revogado -> `INVALIDO`
  - token expirado -> `INVALIDO`
  - token já rotacionado (`proximoTokenId != null`) -> `CONFLITO`
  - cria novo token e atualiza o antigo (`revogadoEm` + `proximoTokenId`)