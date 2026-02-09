// packages/core/src/autorizacao.ts
import { err, ok, type Result } from "./result";
import { erroApp, type ErroApp } from "./errors";
import type { ContextoExecucao, Permissao } from "./contextoExecucao";

export function exigirPermissao(
  ctx: ContextoExecucao,
  permissao: Permissao
): Result<true, ErroApp> {
  if (!ctx.usuarioId) return err(erroApp("NAO_AUTENTICADO", "Usuário não autenticado"));
  if (!ctx.permissoes.has(permissao)) return err(erroApp("NAO_AUTORIZADO", "Sem permissão"));
  return ok(true);
}
