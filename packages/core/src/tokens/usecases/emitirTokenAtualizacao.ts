// packages/core/src/tokens/usecases/emitirTokenAtualizacao.ts

import type { Result } from "../../result";
import { wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import type { TokensRepositorio } from "../portasRepositorio";
import { criarToken, type Token, type TokenId } from "../tipos";
import { erroEntradaInvalida } from "../erros";
import { UsuarioId } from "../../usuarios";
import { LocatarioId } from "../../locatario";

/**
 * 
 */
export type EmitirTokenAtualizacaoParams = {
  repo: TokensRepositorio;
  usuarioId: UsuarioId;
  locatarioId?: LocatarioId | null;
  hashToken: string;
  expiraEm: Date;
  agenteUsuario?: string | null;
  enderecoIp?: string | null;
  gerarTokenId: () => TokenId;
  agora: () => Date;
};

/**
 * 
 */
export type EmitirTokenAtualizacaoResultado = {
  token: Token;
};

/**
 * 
 * @param params 
 * @returns 
 */
export async function emitirTokenAtualizacao(params: EmitirTokenAtualizacaoParams,): Promise<Result<EmitirTokenAtualizacaoResultado, ErroApp>> {
  if (!params.repo) return erroEntradaInvalida("repo é obrigatório.");
  if (!params.usuarioId) return erroEntradaInvalida("usuarioId é obrigatório.");
  if (typeof params.hashToken !== "string" || params.hashToken.trim().length === 0) {
    return erroEntradaInvalida("hashToken é obrigatório.");
  }
  if (!(params.expiraEm instanceof Date) || Number.isNaN(params.expiraEm.getTime())) {
    return erroEntradaInvalida("expiraEm inválido.");
  }

  const agora = params.agora();
  const id = params.gerarTokenId();

  const rToken = criarToken({
    id,
    usuarioId: params.usuarioId,
    locatarioId: params.locatarioId ?? null,
    hashToken: params.hashToken,
    emitidoEm: agora,
    expiraEm: params.expiraEm,
    agenteUsuario: params.agenteUsuario ?? null,
    enderecoIp: params.enderecoIp ?? null,
  });
  if (!rToken.ok) return rToken;

  const token = rToken.value;

  const rIns = await params.repo.inserir(token);
  if (!rIns.ok) return rIns;

  return wrapOk({ token });
}