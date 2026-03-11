import { wrapOk } from "../../result";
import { createContextoExecucao } from "../../contextoExecucao";
import type {
  ResolverContextoAutorizadoInput,
  ResultadoContextoAutorizado,
} from "../tipos";
import type { RbacServicePorta } from "../portasRepositorio";

export function criarResolverContextoAutorizado(deps: {
  rbac: RbacServicePorta;
}) {
  return async function resolverContextoAutorizado(
    input: ResolverContextoAutorizadoInput
  ): ResultadoContextoAutorizado {
    const ctx = createContextoExecucao({
      locatarioId: input.sessao.locatarioId,
      usuarioId: input.sessao.usuarioId,
    });

    const ctxRes = await deps.rbac.resolverPermissoes(ctx);
    if (!ctxRes.ok) return ctxRes;

    return wrapOk(ctxRes.value.ctx);
  };
}