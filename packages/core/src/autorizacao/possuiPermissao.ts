/**
 * Helper central para checar permissão.
 *
 * Evita strings soltas e duplicação de lógica em use cases.
 */

/**
 * Helper central para checar permissão.
 *
 * Evita strings soltas e duplicação de lógica em use cases.
 */

import { ContextoExecucao, normalizarPermissoes } from "../contextoExecucao";
import type { Permissao } from "./permissoes";
import { Result, wrapOk, wrapErr } from "../result";
import { erroApp, ErroApp, mapCodigoErroToMensagemErro } from "../erros";

export function possuiPermissao(contextoExecucao: ContextoExecucao, permissao: Permissao): boolean {
  const permissoes = (contextoExecucao as unknown as { permissoes?: unknown })
    .permissoes;

  if (permissoes instanceof Set) {
    return permissoes.has(permissao);
  }

  return normalizarPermissoes(contextoExecucao).includes(permissao);
}

export function exigirPermissao(ctx: ContextoExecucao, permissao: Permissao): Result<true, ErroApp> {
  if (!ctx.usuarioId) return wrapErr(erroApp("NAO_AUTENTICADO", mapCodigoErroToMensagemErro("NAO_AUTENTICADO")));
  if (!ctx.permissoes?.has(permissao)) return wrapErr(erroApp("NAO_AUTORIZADO", mapCodigoErroToMensagemErro("NAO_AUTORIZADO")));
  return wrapOk(true);
}

