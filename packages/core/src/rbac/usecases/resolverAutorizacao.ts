// packages/core/src/rbac/usecases/resolverAutorizacao.ts

import { createContextoExecucao, exigirUsuario, wrapOk } from "../../kernel";
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
    const ctxAutenticado = exigirUsuario(input.ctx);
    if (!ctxAutenticado.ok) return ctxAutenticado;

    const snapshot = await deps.autorizacaoRepositorio.obterSnapshot({
      locatarioId: ctxAutenticado.value.locatarioId,
      usuarioId: ctxAutenticado.value.usuarioId,
      isPlataforma: false,
    });
    if (!snapshot.ok) return snapshot;

    const ctx = createContextoExecucao({
      locatarioId: snapshot.value.locatarioId,
      usuarioId: snapshot.value.usuarioId,
      papeis: snapshot.value.papeis,
      permissoes: snapshot.value.permissoes,
      modulosHabilitados: snapshot.value.modulos,
      agora: input.ctx.agora,
    });

    return wrapOk<ResolverAutorizacaoOutput>({
      ctx,
    });
  };
}