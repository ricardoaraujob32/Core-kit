// apps/api/src/modules/financeiro/financeiro.presenter.ts

import type { ContaFinanceira, ResumoFinanceiro } from "@core-kit/core";

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function toResumoFinanceiroDto(resumo: ResumoFinanceiro) {
  return {
    locatarioId: resumo.locatarioId,
    totalAReceber: resumo.totalAReceber,
    totalAPagar: resumo.totalAPagar,
    saldoPrevisto: resumo.saldoPrevisto,
    totalRecebidoPeriodo: resumo.totalRecebidoPeriodo,
    totalPagoPeriodo: resumo.totalPagoPeriodo,
    totalVencidoReceber: resumo.totalVencidoReceber,
    totalVencidoPagar: resumo.totalVencidoPagar,
    quantidadeVencidosReceber: resumo.quantidadeVencidosReceber,
    quantidadeVencidosPagar: resumo.quantidadeVencidosPagar,
    geradoEm: toIso(resumo.geradoEm),
  };
}

export function toContaFinanceiraDto(conta: ContaFinanceira) {
  return {
    transacaoId: conta.transacaoId,
    locatarioId: conta.locatarioId,
    tipo: conta.tipo,
    status: conta.status,
    clienteId: conta.clienteId,
    fornecedorId: conta.fornecedorId,
    descricao: conta.descricao,
    valor: conta.valor,
    vencimentoEm: toIso(conta.vencimentoEm),
    criadoEm: toIso(conta.criadoEm),
    atualizadoEm: toIso(conta.atualizadoEm),
  };
}
