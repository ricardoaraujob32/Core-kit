// packages/core/src/auth/usecases/resolverContextoAutorizado.ts

import { wrapOk } from "../../kernel";
import { RbacAuthPorta } from "../portasServico";
import { ResolverContextoAutorizadoInput, ResultadoResolverContextoAutorizado } from "../tipos";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnResolverContextoAutorizado(deps: {
  rbacPorta: RbacAuthPorta;
}) {
  return async function resolverContextoAutorizado(input: ResolverContextoAutorizadoInput): ResultadoResolverContextoAutorizado {
    const ctx = {
      locatarioId: input.sessao.locatarioId,
      usuarioId: input.sessao.usuarioId,
    };

    const ctxRes = await deps.rbacPorta.resolverPermissoes(ctx);
    if (!ctxRes.ok) return ctxRes;

    return wrapOk(ctxRes.value.ctx);
  };
}
