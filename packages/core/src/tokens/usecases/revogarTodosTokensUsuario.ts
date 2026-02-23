// packages/core/src/tokens/usecases/revogarTodosTokensUsuario.ts

import type { Result } from "../../result";
import { wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import type { TokensRepositorio } from "../portasRepositorio";
import type { UsuarioId } from "../../usuarios"; 
import { erroEntradaInvalida } from "../erros";

/**
 * 
 */
export type RevogarTodosTokensUsuarioParams = {
  repo: TokensRepositorio;
  usuarioId: UsuarioId;
  agora: () => Date;
};

/**
 * 
 */
export type RevogarTodosTokensUsuarioResultado = {
  totalEncontrados: number;
  totalRevogadosAgora: number;
};

/**
 * 
 * @param params 
 * @returns 
 */
export async function revogarTodosTokensUsuario(
  params: RevogarTodosTokensUsuarioParams,
): Promise<Result<RevogarTodosTokensUsuarioResultado, ErroApp>> {
  if (!params.repo) return erroEntradaInvalida("repo é obrigatório.");
  if (!params.usuarioId) return erroEntradaInvalida("usuarioId é obrigatório.");

  const rLista = await params.repo.listarPorUsuario(params.usuarioId);
  if (!rLista.ok) return rLista;

  const agora = params.agora();
  const tokens = rLista.value;

  let totalRevogadosAgora = 0;
  for (const t of tokens) {
    if (!t.revogadoEm) {
      totalRevogadosAgora += 1;
      const rUp = await params.repo.atualizar({ ...t, revogadoEm: agora });
      if (!rUp.ok) return rUp;
    }
  }

  return wrapOk({
    totalEncontrados: tokens.length,
    totalRevogadosAgora,
  });
}