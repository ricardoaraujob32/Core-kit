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

---

## Operações do módulo Tokens (contrato de backend)

Abaixo estão as operações esperadas do **módulo Tokens** no Core (camada `packages/core/src/tokens/usecases`), seguindo ROP/Result e a persistência conforme a tabela `tokens` (refresh rotacionado e tokens one-time).

### Operações mínimas (MVP)

1. **emitirSessao**
   - Gera `accessToken` (JWT, stateless, TTL **10 min**) e `refreshToken` (persistido como hash, TTL **14 dias**).
   - Uso: login bem-sucedido.

2. **renovarSessao**
   - Entrada: `refreshToken` atual.
   - Saída: novo `accessToken` + novo `refreshToken`.
   - Regras:
     - valida hash existente, não revogado, não expirado;
     - **rotaciona** criando novo refresh e **encadeia** o antigo (`proximo_token_id`);
     - se o antigo já tem `proximo_token_id` => **replay** => `NAO_AUTENTICADO`.

3. **encerrarSessao** (logout do dispositivo)
   - Entrada: `refreshToken` (ou identificador equivalente).
   - Ação: marca como revogado (ex.: `revogado_em`).
   - Uso: logout “deste dispositivo”.

### Fluxos essenciais de conta (senha/e-mail)

4. **gerarTokenRecuperacaoSenha**
   - Cria token `RECUPERACAO_SENHA` (hash-only), TTL **60 min**, **one-time**.

5. **consumirTokenRecuperacaoSenha**
   - Valida token (existe, não revogado/consumido, não expirado) e **revoga ao consumir**.
   - Retorna dados mínimos para permitir troca de senha com segurança (ex.: `usuarioId`, `locatarioId`).

6. **gerarTokenConfirmacaoEmail**
   - Cria token `CONFIRMACAO_EMAIL` (hash-only), TTL **72 h**, **one-time**.

7. **consumirTokenConfirmacaoEmail**
   - Valida e **revoga ao consumir**.
   - “Confirma e-mail” é efeito no módulo Usuários; Tokens concede o direito/validade do ato.

### Recomendadas (segurança e gestão de sessões)

8. **validarAccessToken** (JWT) + construir `ContextoExecucao`
   - Valida assinatura/expiração e extrai `locatarioId`/`usuarioId`.
   - (Opcional) carrega permissões via RBAC e injeta no contexto.

9. **revogarTodasSessoesDoUsuario** (logout global)
   - Revoga todos os refresh ativos do usuário (no locatário), útil para “sair de todos os dispositivos” e trocas de senha.

10. **listarSessoesAtivas**
   - Lista refresh ativos (metadados como `emitido_em`, `expira_em` e, se houver no schema, `ip`/`userAgent`).

### Validações obrigatórias (para tokens persistidos)

Para refresh/senha/email (persistidos como hash):

- token existe?
- `revogado_em` é `NULL`?
- `expira_em` > `agora()`?
- **refresh**: `proximo_token_id` é `NULL` (senão é replay)

Para tokens one-time (senha/e-mail):

- ao consumir, **revogar** imediatamente (marcar `revogado_em` ou campo equivalente)

### Tempos (TTL) definidos

- **ACESSO**: 10 minutos
- **REFRESH**: 14 dias
- **RECUPERACAO_SENHA**: 60 minutos
- **CONFIRMACAO_EMAIL**: 72 horas

### Transação (atomicidade)

Operações com múltiplas gravações devem rodar sob `Transacao.executar(...)`:

```ts
// packages/core/src/infra/portaTransacao.ts
export type Transacao = {
  executar<T>(fn: () => Promise<T>): Promise<T>;
};