// packages/core/src/financeiro/portasRepositorio.ts
// Finalidade: Porta (contrato) do repositório Financeiro.

import type { LocatarioId } from "../locatario";
import type { LancamentoFinanceiro, LancamentoFinanceiroId } from "./tipos";

export type RepositorioFinanceiro = {
  criar(lancamento: Omit<LancamentoFinanceiro, "id">): Promise<LancamentoFinanceiro>;
  obterPorId(locatarioId: LocatarioId, id: LancamentoFinanceiroId): Promise<LancamentoFinanceiro | null>;
  salvar(lancamento: LancamentoFinanceiro): Promise<void>;
  listar(locatarioId: LocatarioId): Promise<LancamentoFinanceiro[]>;
};
