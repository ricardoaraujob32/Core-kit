import { createContextoExecucao, type ContextoExecucao } from "./contextoExecucao";
import type { ErroApp } from "./erros";
import type { Result } from "./result";
import { wrapOk } from "./result";
import { UsuarioId } from "../usuarios";
import { ModuloCodigo } from "../modulos";
import { createErroApp } from "./ROPHelpers";
import { Papel, Permissao } from "../rbac";

export function temUsuario(ctx: ContextoExecucao): ctx is ContextoExecucao & { usuarioId: UsuarioId } {
  return typeof ctx.usuarioId === "string" && ctx.usuarioId.trim().length > 0;
}

export function exigirUsuario(ctx: ContextoExecucao): Result<ContextoExecucao & { usuarioId: UsuarioId }, ErroApp> {
  return temUsuario(ctx)
    ? wrapOk(ctx)
    : createErroApp({
        codigo: "NAO_AUTENTICADO",
        mensagem: "Usuário não autenticado.",
        detalhes: {},
      });
}

export function normalizarPermissoes(ctx: ContextoExecucao): Permissao[] {
  return Array.isArray(ctx.permissoes) ? [...ctx.permissoes] : [];
}

export function normalizarPapeis(ctx: ContextoExecucao): Papel[] {
  return Array.isArray(ctx.papeis) ? [...ctx.papeis] : [];
}

export function normalizarRelogio(ctx: ContextoExecucao): Date {
  return ctx.agora ? ctx.agora() : new Date();
}

export function normalizarModulosHabilitados(ctx: ContextoExecucao): ModuloCodigo[] {
  return Array.isArray(ctx.modulosHabilitados)
    ? [...ctx.modulosHabilitados]
    : [];
}

function unique<T>(itens: T[]): T[] {
  return Array.from(new Set(itens));
}

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