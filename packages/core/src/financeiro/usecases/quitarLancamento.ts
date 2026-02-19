// packages/core/src/financeiro/usecases/quitarLancamento.ts
// Finalidade: Quitar lançamento (pagar/receber).

import type { ContextoExecucao } from "../../contextoExecucao";
import type { Result } from "../../result";
import { wrapErr, wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import { erroApp } from "../../erros";
import { exigirPermissao } from "../../rbac";

import type { RepositorioFinanceiro } from "../portasRepositorio";

export async function quitarLancamento(
  ctx: ContextoExecucao,
  dependencias: { financeiroRepo: RepositorioFinanceiro },
  input: { lancamentoId: string },
): Promise<Result<{ ok: true }, ErroApp>> {
  const auth = exigirPermissao(ctx, "FINANCEIRO_QUITAR");
  if (!auth.ok) return auth;

  if (ctx.usuarioId === undefined) return wrapErr(erroApp("NAO_AUTENTICADO"));

  const lancamento = await dependencias.financeiroRepo.obterPorId(ctx.locatarioId, input.lancamentoId);
  if (!lancamento) return wrapErr(erroApp("NAO_ENCONTRADO", "Lançamento não encontrado"));

  if (lancamento.status === "CANCELADO") return wrapErr(erroApp("VALIDACAO", "Lançamento cancelado não pode ser quitado"));
  if (lancamento.status === "QUITADO") return wrapErr(erroApp("VALIDACAO", "Lançamento já quitado"));

  lancamento.status = "QUITADO";
  lancamento.quitadoEm = (ctx.agora ?? (() => new Date()))();
  lancamento.quitadoPor = ctx.usuarioId;

  await dependencias.financeiroRepo.salvar(lancamento);

  return wrapOk({ ok: true });
}
