// packages/core/src/tokens/usecases/revogarToken.ts

import type { Result } from "../../result";
import { wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import type { TokensRepositorio } from "../portasRepositorio";
import type { TokenId } from "../tipos";
import { erroEntradaInvalida, erroTokenNaoEncontrado, erroTokenJaRevogado } from "../erros";

/**
 * 
 */
export type RevogarTokenParams = {
  repo: TokensRepositorio;
  tokenId: TokenId;
  agora: () => Date;
};

/**
 * 
 * @param params 
 * @returns 
 */
export async function revogarToken(params: RevogarTokenParams): Promise<Result<void, ErroApp>> {
  if (!params.repo) return erroEntradaInvalida("repo é obrigatório.");
  if (!params.tokenId) return erroEntradaInvalida("tokenId é obrigatório.");

  const rToken = await params.repo.obterPorId(params.tokenId);
  if (!rToken.ok) return rToken;

  const token = rToken.value;
  if (!token) return erroTokenNaoEncontrado(params.tokenId);

  if (token.revogadoEm) return erroTokenJaRevogado();

  const agora = params.agora();
  const atualizado = { ...token, revogadoEm: agora };

  const rUp = await params.repo.atualizar(atualizado);
  if (!rUp.ok) return rUp;

  return wrapOk(undefined);
}