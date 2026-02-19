// packages/core/src/fornecedores/usecases/listarFornecedores.ts
// Finalidade: Caso de uso de listagem de fornecedores (domínio + ROP + RBAC).

import type { ContextoExecucao } from "../../contextoExecucao";
import type { Result } from "../../result";
import type { ErroApp } from "../../erros";
import { exigirPermissao } from "../../rbac";
import type { RepositorioFornecedores } from "../portasRepositorio";
import type { Fornecedor } from "../tipos";

export async function listarFornecedores(
  ctx: ContextoExecucao,
  dependencias: { fornecedoresRepo: RepositorioFornecedores },
): Promise<Result<{ itens: Fornecedor[] }, ErroApp>> {
  const auth = exigirPermissao(ctx, "FORNECEDORES_LER");
  if (!auth.ok) return auth;

  const itens = await dependencias.fornecedoresRepo.listar(ctx.locatarioId);
  return { ok: true, value: { itens } };
}
