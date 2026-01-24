import type { Permissao, ContextoExecucao } from "./locatario";
import { appError } from "./errors";
import { err, ok, type Result } from "./result";

function naoAutenticado(ctx: ContextoExecucao): boolean {
  // `permissoes` ausente geralmente significa que o contexto não foi montado/validado
  // (ex.: request sem autenticação). Nesse caso, tratamos como UNAUTHORIZED.
  return !ctx.usuarioId || ctx.permissoes == null;
}

export function exigirPermissao(
  ctx: ContextoExecucao,
  permissao: Permissao,
): Result<void, ReturnType<typeof appError>> {
  if (naoAutenticado(ctx)) {
    return err(appError("UNAUTHORIZED", "Usuário não autenticado."));
  }

  const permissoes = ctx.permissoes ?? [];
  if (!permissoes.includes(permissao)) {
    return err(appError("FORBIDDEN", "Permissões insuficientes.", { permissaoExigida: permissao }));
  }

  return ok(undefined);
}

export function exigirTodas(
  ctx: ContextoExecucao,
  permissoesExigidas: Permissao[],
): Result<void, ReturnType<typeof appError>> {
  if (naoAutenticado(ctx)) {
    return err(appError("UNAUTHORIZED", "Usuário não autenticado."));
  }

  const permissoes = ctx.permissoes ?? [];
  const faltantes = permissoesExigidas.filter((p) => !permissoes.includes(p));

  if (faltantes.length > 0) {
    // Mantém o payload de details estável e simples para uso em UI/logs
    return err(
      appError("FORBIDDEN", "Permissões insuficientes.", { permissaoExigida: faltantes[0] }),
    );
  }

  return ok(undefined);
}

export function exigirAlguma(
  ctx: ContextoExecucao,
  permissoesExigidas: Permissao[],
): Result<void, ReturnType<typeof appError>> {
  if (naoAutenticado(ctx)) {
    return err(appError("UNAUTHORIZED", "Usuário não autenticado."));
  }

  const permissoes = ctx.permissoes ?? [];
  const temAlguma = permissoesExigidas.some((p) => permissoes.includes(p));

  if (!temAlguma) {
    // Para "alguma", faz sentido mostrar a lista combinada; vazio vira "".
    return err(
      appError("FORBIDDEN", "Permissões insuficientes.", {
        permissaoExigida: permissoesExigidas.join("|"),
      }),
    );
  }

  return ok(undefined);
}
