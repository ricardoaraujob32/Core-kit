// packages/core/src/usuarios/usecases/listarUsuarios.ts
import type { ContextoExecucao } from "../../contextoExecucao";
import { exigirPermissao } from "../../autorizacao";
import type { Result } from "../../result";
import type { ErroApp } from "../../errors";
import type { RepositorioUsuarios } from "../portasRepositorio";

export async function listarUsuarios(
  ctx: ContextoExecucao,
  deps: { usuariosRepo: RepositorioUsuarios }
): Promise<Result<{ itens: unknown[] }, ErroApp>> {
  const auth = exigirPermissao(ctx, "USUARIOS_LER");
  if (!auth.ok) return auth;

  const itens = await deps.usuariosRepo.listar(ctx.locatarioId);
  return { ok: true, value: { itens } };
}
