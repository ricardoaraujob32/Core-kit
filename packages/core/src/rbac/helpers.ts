// packages/core/src/rbac/helpers.ts

import { wrapOk } from "../result";
import type { Result } from "../result";
import type { ErroApp } from "../erros";
import type {
  ContextoExecucaoRbac,
  Papel,
  Permissao,
} from "./tipos";
import { naoAutenticado } from "./erros";

export function temUsuario(
  ctx: ContextoExecucaoRbac,
): ctx is ContextoExecucaoRbac & { usuarioId: string } {
  return typeof ctx.usuarioId === "string" && ctx.usuarioId.trim().length > 0;
}

export function exigirUsuario(
  ctx: ContextoExecucaoRbac,
): Result<ContextoExecucaoRbac & { usuarioId: string }, ErroApp> {
  return temUsuario(ctx) ? wrapOk(ctx) : naoAutenticado();
}

export function normalizarPermissoes(
  ctx: ContextoExecucaoRbac,
): Permissao[] {
  return Array.isArray(ctx.permissoes) ? [...ctx.permissoes] : [];
}

export function normalizarPapeis(
  ctx: ContextoExecucaoRbac,
): Papel[] {
  return Array.isArray(ctx.papeis) ? [...ctx.papeis] : [];
}

function unique<T>(itens: T[]): T[] {
  return Array.from(new Set(itens));
}

export function comPermissoes(
  ctx: ContextoExecucaoRbac,
  permissoes: Permissao[],
): ContextoExecucaoRbac {
  return {
    ...ctx,
    permissoes: unique(permissoes),
  };
}

export function comPapeis(
  ctx: ContextoExecucaoRbac,
  papeis: Papel[],
): ContextoExecucaoRbac {
  return {
    ...ctx,
    papeis: unique(papeis),
  };
}