import { appError, type AppError } from "./errors";
import { err, ok, type Result } from "./result";
import type { ContextoExecucao, Permissao } from "./locatario";

/**
 * Retorna true se o contexto possuir a permissão.
 */
export function temPermissao(ctx: ContextoExecucao, permissao: Permissao): boolean {
  const perms = ctx.permissoes ?? [];
  return perms.includes(permissao);
}

/**
 * Exige UMA permissão específica.
 * Retorna Result<void, AppError> para compor fluxo sem exceção.
 */
export function exigirPermissao(
  ctx: ContextoExecucao,
  permissao: Permissao,
): Result<void, AppError> {
  if (!ctx.usuarioId) {
    return err(appError("UNAUTHORIZED", "Usuário não autenticado."));
  }

  if (!temPermissao(ctx, permissao)) {
    return err(
      appError("FORBIDDEN", "Permissão insuficiente.", {
        permissaoExigida: permissao,
      }),
    );
  }

  return ok(undefined);
}

/**
 * Exige TODAS as permissões da lista (AND).
 */
export function exigirTodas(
  ctx: ContextoExecucao,
  permissoes: Permissao[],
): Result<void, AppError> {
  if (!ctx.usuarioId) {
    return err(appError("UNAUTHORIZED", "Usuário não autenticado."));
  }

  const perms = ctx.permissoes ?? [];
  const faltantes = permissoes.filter((p) => !perms.includes(p));

  if (faltantes.length > 0) {
    return err(
      appError("FORBIDDEN", "Permissões insuficientes.", {
        permissoesExigidas: permissoes,
        permissoesFaltantes: faltantes,
      }),
    );
  }

  return ok(undefined);
}

/**
 * Exige PELO MENOS UMA permissão da lista (OR).
 */
export function exigirAlguma(
  ctx: ContextoExecucao,
  permissoes: Permissao[],
): Result<void, AppError> {
  if (!ctx.usuarioId) {
    return err(appError("UNAUTHORIZED", "Usuário não autenticado."));
  }

  const perms = ctx.permissoes ?? [];
  const temAlguma = permissoes.some((p) => perms.includes(p));

  if (!temAlguma) {
    return err(
      appError("FORBIDDEN", "Permissão insuficiente.", {
        permissoesAceitas: permissoes,
      }),
    );
  }

  return ok(undefined);
}
