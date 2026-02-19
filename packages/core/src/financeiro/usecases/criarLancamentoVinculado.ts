// packages/core/src/financeiro/usecases/criarLancamentoVinculado.ts
// Finalidade: Criar lançamento vinculado (transação/OS) com tipo coerente.

import type { ContextoExecucao } from "../../contextoExecucao";
import type { Result } from "../../result";
import { wrapErr, wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import { erroApp } from "../../erros";
import { exigirPermissao } from "../../rbac";

import type { RepositorioFinanceiro } from "../portasRepositorio";
import type { OrigemLancamentoFinanceiro, TipoLancamentoFinanceiro } from "../tipos";
import { descricaoValida, valorCentavosValido } from "../validadores";

export async function criarLancamentoVinculado(
  ctx: ContextoExecucao,
  dependencias: { financeiroRepo: RepositorioFinanceiro },
  input: {
    origem: Exclude<OrigemLancamentoFinanceiro, { tipo: "MANUAL" }>;
    valorCentavos: number;
    descricao: string;
    vencimentoEm?: Date;
  },
): Promise<Result<{ id: string; tipo: TipoLancamentoFinanceiro }, ErroApp>> {
  const auth = exigirPermissao(ctx, "FINANCEIRO_CRIAR");
  if (!auth.ok) return auth;

  if (ctx.usuarioId === undefined) return wrapErr(erroApp("NAO_AUTENTICADO"));

  if (!valorCentavosValido(input.valorCentavos)) return wrapErr(erroApp("VALIDACAO", "Valor inválido"));
  if (!descricaoValida(input.descricao)) return wrapErr(erroApp("VALIDACAO", "Descrição inválida"));

  const tipo: TipoLancamentoFinanceiro =
    input.origem.tipo === "TRANSACAO"
      ? (input.origem.natureza === "VENDA" ? "RECEITA" : "DESPESA")
      : "RECEITA"; // OS normalmente gera receita (pode evoluir depois)

  const agora = (ctx.agora ?? (() => new Date()))();

  const lancamento = await dependencias.financeiroRepo.criar({
    locatarioId: ctx.locatarioId,
    tipo,
    status: "ABERTO",
    valorCentavos: input.valorCentavos,
    descricao: input.descricao.trim(),
    origem: input.origem,
    vencimentoEm: input.vencimentoEm,
    criadoEm: agora,
    criadoPor: ctx.usuarioId,
  });

  return wrapOk({ id: lancamento.id, tipo });
}
