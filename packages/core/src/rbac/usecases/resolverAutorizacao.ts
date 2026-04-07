// packages/core/src/rbac/usecases/resolverAutorizacao.ts

import { createContextoExecucao, wrapOk } from "../../kernel";
import { AutorizacaoRepositorio } from "../portasRepositorio";
import { ResolverAutorizacaoInput, ResolverAutorizacaoOutput, ResolverAutorizacaoResult } from "../tipos";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnResolverAutorizacao(deps: { autorizacaoRepositorio: AutorizacaoRepositorio } ) {
/**
 * 
 */
  return async function resolverAutorizacao(input: ResolverAutorizacaoInput): ResolverAutorizacaoResult {
    if (!input.ctx.usuarioId) {
      return wrapOk({ ctx: input.ctx });
    }

    const snapshot = await deps.autorizacaoRepositorio.obterSnapshot({
      locatarioId: input.ctx.locatarioId,
      usuarioId: input.ctx.usuarioId,
      isPlataforma: false,
    });

    if (!snapshot.ok) {
      return snapshot;
    }

    const ctx = createContextoExecucao({
      locatarioId: input.ctx.locatarioId,
      usuarioId: input.ctx.usuarioId,
      papeis: snapshot.value.papeis,
      permissoes: snapshot.value.permissoes,
      modulosHabilitados: snapshot.value.modulos,
      agora: input.ctx.agora,
    });

    return wrapOk<ResolverAutorizacaoOutput>({ ctx });
  };
}
