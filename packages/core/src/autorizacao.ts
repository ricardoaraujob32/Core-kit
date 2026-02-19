/**
 * packages/core/src/autorizacao.ts
 * 
 */

import { normalizarPermissoes, type ContextoExecucao } from "./contextoExecucao";
import type { Result } from "./result";
import { wrapOk } from "./result";
import { erroApp } from "./erros";
import { createErroApp } from "./ROPHelpers";
import { Permissao } from "./autorizacao/permissoes";

/**
 * Autoriza a execução com base no ContextoExecucao.
 *
 * Regras (Opção A):
 * - Sem usuarioId (undefined) => NAO_AUTENTICADO
 * - Com usuarioId, mas sem permissão => NAO_AUTORIZADO
 * - Com permissão => OK
 */
export function autorizar(ctx: ContextoExecucao, permissao: Permissao): Result<true, ReturnType<typeof erroApp>> {
  if (ctx.usuarioId === undefined) {
    return createErroApp( {codigo:"NAO_AUTENTICADO"} );
  }

  const permissoes = normalizarPermissoes(ctx);
  if (!permissoes.includes(permissao)) {
    return createErroApp( {codigo:"NAO_AUTORIZADO"} );
  }

  return wrapOk(true);
}
