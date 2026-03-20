// packages/core/src/rbac/helpers.ts

import { ErroApp, Result, wrapOk } from "../kernel";
import type { ContextoExecucaoRbac, Papel, Permissao } from "./tipos";
import { naoAutenticado } from "./erros";
import { UsuarioId } from "../usuarios";

/**
 * 
 * @param ctx 
 * @returns 
 */
export function temUsuario(ctx: ContextoExecucaoRbac): ctx is ContextoExecucaoRbac & { usuarioId: UsuarioId } {
  return typeof ctx.usuarioId === "string" && ctx.usuarioId.trim().length > 0;
}

/**
 * 
 * @param ctx 
 * @returns 
 */
export function exigirUsuario(ctx: ContextoExecucaoRbac): Result<ContextoExecucaoRbac & { usuarioId: UsuarioId }, ErroApp> {
  return temUsuario(ctx) ? wrapOk(ctx) : naoAutenticado();
}

/**
 * 
 * @param ctx 
 * @returns 
 */
export function normalizarPermissoes(ctx: ContextoExecucaoRbac): Permissao[] {
  return Array.isArray(ctx.permissoes) ? [...ctx.permissoes] : [];
}

/**
 * 
 * @param ctx 
 * @returns 
 */
export function normalizarPapeis(ctx: ContextoExecucaoRbac): Papel[] {
  return Array.isArray(ctx.papeis) ? [...ctx.papeis] : [];
}

/**
 * 
 * @param itens 
 * @returns 
 */
function unique<T>(itens: T[]): T[] {
  return Array.from(new Set(itens));
}

/**
 * 
 * @param ctx 
 * @param permissoes 
 * @returns 
 */
export function comPermissoes(ctx: ContextoExecucaoRbac, permissoes: Permissao[]): ContextoExecucaoRbac {
  return {
    ...ctx,
    permissoes: unique(permissoes),
  };
}

/**
 * 
 * @param ctx 
 * @param papeis 
 * @returns 
 */
export function comPapeis(ctx: ContextoExecucaoRbac, papeis: Papel[]): ContextoExecucaoRbac {
  return {
    ...ctx,
    papeis: unique(papeis),
  };
}
