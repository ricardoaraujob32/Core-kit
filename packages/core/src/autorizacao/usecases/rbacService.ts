import { RbacRepositorio } from "../portasRepositorio";
import { wrapOk, wrapErr } from "../../result";
import { ContextoExecucao } from "../../contextoExecucao";

export function criarRbacService(deps: { repo: RbacRepositorio }) {
  const cache = new WeakMap<object, Set<string>>();

  async function resolverPermissoesEfetivas(input: {
    locatarioId: string;
    usuarioId: string;
  }) {
    const r = await deps.repo.listarPermissoesDoUsuario(input);
    if (!r.ok) return r;

    return wrapOk(new Set(r.value));
  }

  async function exigirPermissao(
    ctx: ContextoExecucao,
    permissao: string,
  ) {
    if (!ctx.usuarioId) {
      return wrapErr({
        codigo: "NAO_AUTENTICADO",
        mensagem: "Usuário não autenticado.",
      });
    }

    let perms = cache.get(ctx);

    if (!perms) {
      const r = await resolverPermissoesEfetivas({
        locatarioId: ctx.locatarioId,
        usuarioId: ctx.usuarioId,
      });

      if (!r.ok) return r;

      perms = r.value;
      cache.set(ctx, perms);
    }

    if (!perms.has(permissao)) {
      return wrapErr({
        codigo: "NAO_AUTORIZADO",
        mensagem: `Usuário não possui permissão ${permissao}`,
      });
    }

    return wrapOk(undefined);
  }

  return {
    resolverPermissoesEfetivas,
    exigirPermissao,
  };
}