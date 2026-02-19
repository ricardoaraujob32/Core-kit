// packages/core/src/financeiro/usecases/criarLancamento.ts
// Finalidade: Criar lançamento financeiro manual.

import type { ContextoExecucao } from "../../contextoExecucao";
import type { Result } from "../../result";
import { wrapErr, wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import { erroApp } from "../../erros";
import { exigirPermissao } from "../../rbac";

import type { RepositorioFinanceiro } from "../portasRepositorio";
import type { TipoLancamentoFinanceiro } from "../tipos";
import { descricaoValida, valorCentavosValido } from "../validadores";

export async function criarLancamento(
  ctx: ContextoExecucao,
  dependencias: { financeiroRepo: RepositorioFinanceiro },
  input: {
    tipo: TipoLancamentoFinanceiro;
    valorCentavos: number;
    descricao: string;
    vencimentoEm?: Date;
  },
): Promise<Result<{ id: string }, ErroApp>> {
  const auth = exigirPermissao(ctx, "FINANCEIRO_CRIAR");
  if (!auth.ok) return auth;

  if (ctx.usuarioId === undefined) return wrapErr(erroApp("NAO_AUTENTICADO"));

  if (!valorCentavosValido(input.valorCentavos)) return wrapErr(erroApp("VALIDACAO", "Valor inválido"));
  if (!descricaoValida(input.descricao)) return wrapErr(erroApp("VALIDACAO", "Descrição inválida"));

  const agora = (ctx.agora ?? (() => new Date()))();

  const lancamento = await dependencias.financeiroRepo.criar({
    locatarioId: ctx.locatarioId,
    tipo: input.tipo,
    status: "ABERTO",
    valorCentavos: input.valorCentavos,
    descricao: input.descricao.trim(),
    origem: { tipo: "MANUAL" },
    vencimentoEm: input.vencimentoEm,
    criadoEm: agora,
    criadoPor: ctx.usuarioId,
  });

  return wrapOk({ id: lancamento.id });
}
