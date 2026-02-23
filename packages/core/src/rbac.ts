// packages/core/src/rbac.ts

// Finalidade: Autorização RBAC (borda do domínio) usando ContextoExecucao + Result (ROP).

import { ContextoExecucao, normalizarPermissoes } from "./contextoExecucao";
import { Permissao } from "./autorizacao/index";
import { ErroApp, erroApp } from "./erros";
import { isErr, wrapOk, type Result } from "./result";
import { createErroApp } from "./ROPHelpers";

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

/**
 * // "permissoes ausente" => trata como NÃO AUTORIZADO (seus testes pedem isso)
 * @param ctx 
 * @returns 
 */
function semPermissoesResolvidas(ctx: ContextoExecucao): boolean {
  return !Array.isArray(ctx.permissoes);
}

/**
 * Valida se o contexto tem a permissão requerida
 * @param ctx o contexto do locatário
 * @param perm a permissão
 * @returns um Result com o contexto validado se for sucesso; do contrário, um Result de erro
 */
export function possuiPermissao(ctx: ContextoExecucao, permissao: Permissao): Result<true, ErroApp> {
  if (semPermissoesResolvidas(ctx)) {
    return createErroApp( { codigo:"NAO_AUTORIZADO", mensagem:"Permissões não resolvidas no contexto." } );
  }

  if (!ctx.permissoes?.includes(permissao)) {
    return createErroApp( { codigo:"NAO_AUTORIZADO", mensagem:"Permissão ausente." } );
  }

  return wrapOk(true);
}

/**
 * `permissoes` ausente geralmente significa que o contexto não foi montado/validado
 * (ex.: request sem autenticação). Nesse caso, tratamos como não autorizado.
 * @param ctx o contexto do locatário
 * @returns true se não está autenticado; do contrário, false
 */
function naoAutenticado(ctx: ContextoExecucao): boolean {
  return ctx.usuarioId === undefined;
}

/**
 * Verifica se o contexto tem todas as permissões mostradas
 * @param ctx o contexto do locatário
 * @param permissoesExigidas a lista de permissões
 * @returns um Result vazio se for sucesso; do contrário, um Result de erro
 */
export function exigirTodas(ctx: ContextoExecucao, permissoes: readonly Permissao[],): Result<true, ReturnType<typeof erroApp>> {
  if (naoAutenticado(ctx)) return createErroApp( {codigo:"NAO_AUTENTICADO"} );

  for (const p of permissoes) {
    const r = possuiPermissao(ctx, p);
    if (isErr(r)) {
      return createErroApp( {codigo:"NAO_AUTORIZADO"} );
    }
  }

  return wrapOk(true);
}

/**
 * Verfica se o contexto tem alguma permissão mostrada
 * @param ctx o contexto do locatário
 * @param permissoesExigidas a lista de permissões
 * @returns um Result vazio se for sucesso; do contrário, um Result de erro
 */
export function exigirAlguma(ctx: ContextoExecucao, permissoes: readonly Permissao[],): Result<true, ReturnType<typeof erroApp>> {
  if (naoAutenticado(ctx)) return createErroApp( {codigo:"NAO_AUTENTICADO"} );

  for (const p of permissoes) {
    const r = possuiPermissao(ctx, p);
    if (!isErr(r)) return wrapOk(true);
  }

  return createErroApp( {codigo:"NAO_AUTORIZADO"} );
}
