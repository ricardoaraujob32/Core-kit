// packages/core/src/estoque/usecases/listarItensCatalogo.ts
// Finalidade: Listagem do catálogo do locatário (RBAC + ROP).

import type { ContextoExecucao } from "../../contextoExecucao";
import type { Result } from "../../result";
import type { ErroApp } from "../../erros";
import { exigirPermissao } from "../../rbac";

import type { RepositorioEstoque } from "../portasRepositorio";
import type { ItemCatalogo } from "../tipos";

export async function listarItensCatalogo(
  ctx: ContextoExecucao,
  dependencias: { estoqueRepo: RepositorioEstoque },
): Promise<Result<{ itens: ItemCatalogo[] }, ErroApp>> {
  const auth = exigirPermissao(ctx, "ESTOQUE_LER");
  if (!auth.ok) return auth;

  const itens = await dependencias.estoqueRepo.listarItens(ctx.locatarioId);
  return { ok: true, value: { itens } };
}
