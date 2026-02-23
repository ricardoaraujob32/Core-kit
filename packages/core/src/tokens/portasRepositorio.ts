// packages/core/src/tokens/portasRepositorio.ts

import type { Result } from "../result";
import type { ErroApp } from "../erros";
import type { Token, TokenId } from "./tipos";
import { UsuarioId } from "../usuarios";

/**
 * Porta (interface) para persistência de tokens.
 * Usecases dependem disso; implementação pode ser Postgres, memória, etc.
 */
export interface TokensRepositorio {
  inserir(token: Token): Promise<Result<void, ErroApp>>;
  atualizar(token: Token): Promise<Result<void, ErroApp>>;
  obterPorId(tokenId: TokenId): Promise<Result<Token | null, ErroApp>>;
  listarPorUsuario(usuarioId: UsuarioId): Promise<Result<readonly Token[], ErroApp>>; //Opcional, mas útil:achar token ativo por usuário (para políticas de sessão)
}