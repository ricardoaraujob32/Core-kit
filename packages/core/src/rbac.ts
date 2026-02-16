// packages/core/src/rbac.ts

import { ContextoExecucao } from "./contextoExecucao";
import { Permissao } from "./autorizacao/index";
import { erroApp } from "./erros";
import { wrapErr, wrapOk, type Result } from "./result";

/**
 * `permissoes` ausente geralmente significa que o contexto não foi montado/validado
 * (ex.: request sem autenticação). Nesse caso, tratamos como não autorizado.
 * @param ctx 
 * @returns 
 */
function naoAutenticado(ctx: ContextoExecucao): boolean {
  return !ctx.usuarioId || ctx.permissoes == null;
}

/**
 * 
 * @param ctx 
 * @param permissao 
 * @returns 
 */
export function exigirPermissao(ctx: ContextoExecucao, permissao: Permissao,): Result<void, ReturnType<typeof erroApp>> {
  if (naoAutenticado(ctx)) {
    return wrapErr(erroApp("NAO_AUTENTICADO", "Usuário não autenticado."));
  }

  const permissoes = ctx.permissoes ?? [];
  if (!permissoes.includes(permissao)) {
    return wrapErr(erroApp("NAO_AUTORIZADO", "Permissões insuficientes.", { permissaoExigida: permissao }));
  }

  return wrapOk(undefined);
}

/**
 * 
 * @param ctx 
 * @param permissoesExigidas 
 * @returns 
 */
export function exigirTodas(ctx: ContextoExecucao, permissoesExigidas: Permissao[],): Result<void, ReturnType<typeof erroApp>> {
  if (naoAutenticado(ctx)) {
    return wrapErr(erroApp("NAO_AUTENTICADO", "Usuário não autenticado."));
  }

  const permissoes = ctx.permissoes ?? [];
  const faltantes = permissoesExigidas.filter((p) => !permissoes.includes(p));

  if (faltantes.length > 0) {
    // Mantém o payload de details estável e simples para uso em UI/logs
    return wrapErr(
      erroApp("NAO_AUTORIZADO", "Permissões insuficientes.", { permissaoExigida: faltantes[0] }),
    );
  }

  return wrapOk(undefined);
}

/**
 * 
 * @param ctx 
 * @param permissoesExigidas 
 * @returns 
 */
export function exigirAlguma(ctx: ContextoExecucao, permissoesExigidas: Permissao[],): Result<void, ReturnType<typeof erroApp>> {
  if (naoAutenticado(ctx)) {
    return wrapErr(erroApp("NAO_AUTENTICADO", "Usuário não autenticado."));
  }

  const permissoes = ctx.permissoes ?? [];
  const temAlguma = permissoesExigidas.some((p) => permissoes.includes(p));

  if (!temAlguma) {
    // Para "alguma", faz sentido mostrar a lista combinada; vazio vira "".
    return wrapErr(
      erroApp("NAO_AUTORIZADO", "Permissões insuficientes.", {permissaoExigida: permissoesExigidas.join("|")
      }),
    );
  }

  return wrapOk(undefined);
}
