// packages/core/src/rbac.ts

// Finalidade: Autorização RBAC (borda do domínio) usando ContextoExecucao + Result (ROP).

import { ContextoExecucao, createContextoExecucao } from "./contextoExecucao";
import { Permissao } from "./permissoes";
import { ErroApp, erroApp } from "./erros";
import { isErr, wrapOk, type Result } from "./result";
import { createErroApp } from "./ROPHelpers";
import { UsuarioId } from "./usuarios";
import { Papel } from "./papeis";

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

/**
 * Type-guard: indica se o contexto tem usuário autenticado.
 * @param ctx o contexto do locatário
 * @returns true se o contexto tem usuário; do contrário, false
 */
export function temUsuario(ctx: ContextoExecucao,): ctx is ContextoExecucao & { usuarioId: UsuarioId } {
  return typeof ctx.usuarioId === "string" && ctx.usuarioId.trim().length > 0;
}

/**
 * Valida se o contexto tem usuário
 * @param ctx o contexto do locatário
 * @returns um Result com o contexto validado se for sucesso; do contrário, um Result de erro
 */
export function exigirUsuario(ctx: ContextoExecucao): Result<ContextoExecucao & { usuarioId: UsuarioId }, ErroApp> {
  return !temUsuario(ctx)? createErroApp( {codigo: "NAO_AUTENTICADO"} ) : wrapOk(ctx);
}

/**
 * Normaliza permissões (sempre retorna array).
 * Útil para evitar `ctx.permissoes ?? []` espalhado.
 * @param ctx o contexto do locatário
 * @returns as permissões normalizadas
 */
export function normalizarPermissoes(ctx: ContextoExecucao): Permissao[] {
  return Array.isArray(ctx.permissoes) ? ctx.permissoes : [];
}

/**
 * Normaliza papéis (sempre retorna array).
 * @param ctx o contexto do locatário
 * @returns os papéis normalizados
 */
export function normalizarPapeis(ctx: ContextoExecucao): Papel[] {
  return Array.isArray(ctx.papeis) ? ctx.papeis : [];
}

/**
 * Cria uma função que não recebe argumentos e retorna Date; retorna a existente se houver
 * @param ctx o contexto do locatário
 * @returns a função existente; se não existe, cria uma nova
 */
export function normalizarRelogio(ctx: ContextoExecucao): Date {
  return ctx.agora ? ctx.agora() : new Date();
}

/**
 * Elimina dados duplicados de um vetor
 * @param array o vetor
 * @returns um vetor que garante dados sem duplicações
 */
function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Cria um novo contexto com permissões resolvidas (imutável). 
 * @param ctx o contexto do locatário
 * @param permissoes a lista de permissões
 * @returns um contexto novo com as permissões acrescentadas
 */
export function comPermissoes(ctx: ContextoExecucao, permissoes: Permissao[]): ContextoExecucao {
  return createContextoExecucao( {locatarioId: ctx.locatarioId, usuarioId: ctx.usuarioId, papeis: ctx.papeis, permissoes, agora: ctx.agora,} );
}

/**
 * Cria um novo contexto com papéis resolvidos (imutável).
 * @param ctx o contexto do locatário
 * @param papeis a lista de papéis
 * @returns um contexto novo com os papéis acrescentados
 */
export function comPapeis(ctx: ContextoExecucao, papeis: Papel[]): ContextoExecucao {
  return createContextoExecucao( {locatarioId: ctx.locatarioId, usuarioId: ctx.usuarioId, papeis, permissoes: ctx.permissoes, agora: ctx.agora,} );
}
