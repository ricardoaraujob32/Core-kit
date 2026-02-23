// packages/core/src/tokens/repositorioMemoria.ts

import type { Result } from "../result";
import { wrapOk } from "../result";
import type { ErroApp } from "../erros";
import type { Token, TokenId } from "./tipos";
import type { TokensRepositorio } from "./portasRepositorio";
import type { UsuarioId } from "../usuarios";

/**
 *  Repositório em memória (útil para testes locais e smoke tests).
 * Não faz I/O e não aplica locks.
 * @param seed 
 * @returns 
 */
export function criarRepositorioTokensMemoria(seed?: readonly Token[]): TokensRepositorio {
  const byId = new Map<string, Token>();
  if (seed) for (const t of seed) byId.set(t.id as unknown as string, t);

  return {
    async inserir(token: Token): Promise<Result<void, ErroApp>> {
      byId.set(token.id as unknown as string, token);
      return wrapOk(undefined);
    },

    async atualizar(token: Token): Promise<Result<void, ErroApp>> {
      byId.set(token.id as unknown as string, token);
      return wrapOk(undefined);
    },

    async obterPorId(tokenId: TokenId): Promise<Result<Token | null, ErroApp>> {
      const t = byId.get(tokenId as unknown as string) ?? null;
      return wrapOk(t);
    },

    async listarPorUsuario(usuarioId: UsuarioId): Promise<Result<readonly Token[], ErroApp>> {
      const uid = usuarioId as unknown as string;
      const all: Token[] = [];
      for (const t of byId.values()) {
        if ((t.usuarioId as unknown as string) === uid) all.push(t);
      }
      return wrapOk(all);
    },
  };
}