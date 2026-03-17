import { wrapOk } from "../../kernel/result";
import type {
  ResolverContextoAutorizadoInput,
  ResultadoResolverContextoAutorizado,
} from "../tipos";
import type { RbacAuthPorta } from "../portasServico";

export function criarResolverContextoAutorizado(deps: {
  rbacPorta: RbacAuthPorta;
}) {
  return async function resolverContextoAutorizado(
    input: ResolverContextoAutorizadoInput,
  ): ResultadoResolverContextoAutorizado {
    const ctx = {
      locatarioId: input.sessao.locatarioId,
      usuarioId: input.sessao.usuarioId,
    };

    const ctxRes = await deps.rbacPorta.resolverPermissoes(ctx);
    if (!ctxRes.ok) return ctxRes;

    return wrapOk(ctxRes.value.ctx);
  };
}