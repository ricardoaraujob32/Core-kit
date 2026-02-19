/**
 * Arquivo: packages/core/src/financeiro/repositorioMemoria.ts
 * Finalidade: Implementação em memória de RepositorioFinanceiro (testes/dev).
 */

import type { LocatarioId } from "../locatario";
import type { RepositorioFinanceiro } from "./portasRepositorio";
import type { LancamentoFinanceiro, LancamentoFinanceiroId } from "./tipos";

export function criarRepositorioFinanceiroEmMemoria(): RepositorioFinanceiro {
  const registros: LancamentoFinanceiro[] = [];
  let sequencia = 1;

  function novoId(): LancamentoFinanceiroId {
    return `fin_${sequencia++}`;
  }

  return {
    async criar(dados) {
      const l: LancamentoFinanceiro = { ...dados, id: novoId() };
      registros.push(l);
      return l;
    },

    async obterPorId(locatarioId: LocatarioId, id: LancamentoFinanceiroId) {
      return registros.find((x) => x.locatarioId === locatarioId && x.id === id) ?? null;
    },

    async salvar(lancamento: LancamentoFinanceiro) {
      const idx = registros.findIndex((x) => x.locatarioId === lancamento.locatarioId && x.id === lancamento.id);
      if (idx >= 0) registros[idx] = lancamento;
    },

    async listar(locatarioId: LocatarioId) {
      return registros.filter((x) => x.locatarioId === locatarioId);
    },
  };
}
