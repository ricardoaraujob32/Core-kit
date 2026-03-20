import { createContextoExecucao, type ContextoExecucao } from "./contextoExecucao";
import type { ErroApp } from "./erros";
import type { Result } from "./result";
import { wrapOk } from "./result";
import { UsuarioId } from "../usuarios";
import { ModuloCodigo } from "../modulos";
import { createErroApp } from "./ROPHelpers";
import { Papel, Permissao } from "../rbac";

/**
 * 
 * @param ctx 
 * @returns 
 */
export function temUsuario(ctx: ContextoExecucao): ctx is ContextoExecucao & { usuarioId: UsuarioId } {
  return typeof ctx.usuarioId === "string" && ctx.usuarioId.trim().length > 0;
}

/**
 * 
 * @param ctx 
 * @returns 
 */
export function exigirUsuario(ctx: ContextoExecucao): Result<ContextoExecucao & { usuarioId: UsuarioId }, ErroApp> {
  return temUsuario(ctx)
    ? wrapOk(ctx)
    : createErroApp({
        codigo: "NAO_AUTENTICADO",
        mensagem: "Usuário não autenticado.",
        detalhes: {},
      });
}

/**
 * 
 * @param ctx 
 * @returns 
 */
export function normalizarPermissoes(ctx: ContextoExecucao): Permissao[] {
  return Array.isArray(ctx.permissoes) ? [...ctx.permissoes] : [];
}

/**
 * 
 * @param ctx 
 * @returns 
 */
export function normalizarPapeis(ctx: ContextoExecucao): Papel[] {
  return Array.isArray(ctx.papeis) ? [...ctx.papeis] : [];
}

/**
 * 
 * @param ctx 
 * @returns 
 */
export function normalizarRelogio(ctx: ContextoExecucao): Date {
  return ctx.agora ? ctx.agora() : new Date();
}

/**
 * 
 * @param ctx 
 * @returns 
 */
export function normalizarModulosHabilitados(ctx: ContextoExecucao): ModuloCodigo[] {
  return Array.isArray(ctx.modulosHabilitados)
    ? [...ctx.modulosHabilitados]
    : [];
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
export function comPermissoes(ctx: ContextoExecucao, permissoes: Permissao[]): ContextoExecucao {
  return createContextoExecucao({
    locatarioId: ctx.locatarioId,
    usuarioId: ctx.usuarioId,
    papeis: ctx.papeis,
    permissoes: unique(permissoes),
    modulosHabilitados: ctx.modulosHabilitados,
    agora: ctx.agora,
  });
}

/**
 * 
 * @param ctx 
 * @param papeis 
 * @returns 
 */
export function comPapeis(ctx: ContextoExecucao, papeis: Papel[]): ContextoExecucao {
  return createContextoExecucao({
    locatarioId: ctx.locatarioId,
    usuarioId: ctx.usuarioId,
    papeis: unique(papeis),
    permissoes: ctx.permissoes,
    modulosHabilitados: ctx.modulosHabilitados,
    agora: ctx.agora,
  });
}

/**
 * 
 * @param ctx 
 * @param modulosHabilitados 
 * @returns 
 */
export function comModulosHabilitados(ctx: ContextoExecucao, modulosHabilitados: ModuloCodigo[]): ContextoExecucao {
  return createContextoExecucao({
    locatarioId: ctx.locatarioId,
    usuarioId: ctx.usuarioId,
    papeis: ctx.papeis,
    permissoes: ctx.permissoes,
    modulosHabilitados: unique(modulosHabilitados),
    agora: ctx.agora,
  });
}
