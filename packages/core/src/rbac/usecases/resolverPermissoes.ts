import { wrapOk } from "../../result";
import type { RbacRepositorio } from "../portasRepositorio";
import type { ResolverPermissoesInput, ResolverPermissoesOutput, ResultadoResolverPermissoes } from "../tipos";
import { Permissao } from "../../permissoes";
import { Papel } from "../../papeis";
import { comPapeis, comPermissoes, exigirUsuario } from "../../rbac";

type CacheEntry = {
  permissoes: Permissao[];
  papeis: Papel[];
};

export function resolverPermissoes(deps: {
  rbacRepo: RbacRepositorio;
}) {
  const cache = new WeakMap<object, CacheEntry>();

  return async function resolverPermissoes(
    input: ResolverPermissoesInput
  ): ResultadoResolverPermissoes {
    const ctxAutenticado = exigirUsuario(input.ctx);
    if (!ctxAutenticado.ok) return ctxAutenticado;

    const cacheHit = cache.get(input.ctx as object);
    if (cacheHit) {
      const ctxComPermissoes = comPermissoes(input.ctx, cacheHit.permissoes);
      const ctxFinal = comPapeis(ctxComPermissoes, cacheHit.papeis);

      return wrapOk<ResolverPermissoesOutput>({
        ctx: ctxFinal,
        permissoes: cacheHit.permissoes,
        papeis: cacheHit.papeis,
      });
    }

    const { locatarioId, usuarioId } = ctxAutenticado.value;

    const permissoesRes =
      await deps.rbacRepo.listarPermissoesEfetivasDoUsuario({
        locatarioId,
        usuarioId,
      });
    if (!permissoesRes.ok) return permissoesRes;

    const papeisRes = await deps.rbacRepo.listarPapeisDoUsuario({
      locatarioId,
      usuarioId,
    });
    if (!papeisRes.ok) return papeisRes;

    const permissoes = [...permissoesRes.value];
    const papeis = [...papeisRes.value];

    cache.set(input.ctx as object, { permissoes, papeis });

    const ctxComPermissoes = comPermissoes(input.ctx, permissoes);
    const ctxFinal = comPapeis(ctxComPermissoes, papeis);

    return wrapOk<ResolverPermissoesOutput>({
      ctx: ctxFinal,
      permissoes,
      papeis,
    });
  };
}