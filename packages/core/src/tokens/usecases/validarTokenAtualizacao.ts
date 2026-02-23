// packages/core/src/tokens/usecases/validarTokenAtualizacao.ts

import type { Result } from "../../result";
import { wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import type { TokensRepositorio } from "../portasRepositorio";
import { tokenEstaExpirado, tokenEstaRevogado, type Token, type TokenId } from "../tipos";
import { erroEntradaInvalida, erroTokenNaoEncontrado, erroTokenExpirado, erroTokenRevogado } from "../erros";

/**
 * 
 */
export type ValidarTokenAtualizacaoParams = {
  repo: TokensRepositorio;
  tokenId: TokenId;
  agora: () => Date;
};

/**
 * 
 */
export type ValidarTokenAtualizacaoResultado = {
  token: Token;
};

/**
 * 
 * @param params 
 * @returns 
 */
export async function validarTokenAtualizacao(
  params: ValidarTokenAtualizacaoParams,
): Promise<Result<ValidarTokenAtualizacaoResultado, ErroApp>> {
  if (!params.repo) return erroEntradaInvalida("repo é obrigatório.");
  if (!params.tokenId) return erroEntradaInvalida("tokenId é obrigatório.");

  const rToken = await params.repo.obterPorId(params.tokenId);
  if (!rToken.ok) return rToken;

  const token = rToken.value;
  if (!token) return erroTokenNaoEncontrado(params.tokenId);

  const agora = params.agora();
  if (tokenEstaRevogado(token)) return erroTokenRevogado();
  if (tokenEstaExpirado(token, agora)) return erroTokenExpirado();

  return wrapOk({ token });
}