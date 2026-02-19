// packages/core/src/financeiro/usecases/listarLancamentos.ts
// Finalidade: Listar lançamentos do locatário.

import type { ContextoExecucao } from "../../contextoExecucao";
import type { Result } from "../../result";
import { wrapErr, wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import { erroApp } from "../../erros";
import { exigirPermissao } from "../../rbac";

import type { RepositorioFinanceiro } from "../portasRepositorio";
import type { LancamentoFinanceiro } from "../tipos";

export async function listarLancamentos(
  ctx: ContextoExecucao,
  dependencias: { financeiroRepo: RepositorioFinanceiro },
  _input: {},
): Promise<Result<{ lancamentos: LancamentoFinanceiro[] }, ErroApp>> {
  const auth = exigirPermissao(ctx, "FINANCEIRO_LISTAR");
  if (!auth.ok) return auth;

  if (ctx.usuarioId === undefined) return wrapErr(erroApp("NAO_AUTENTICADO"));

  const lancamentos = await dependencias.financeiroRepo.listar(ctx.locatarioId);
  return wrapOk({ lancamentos });
}
