// packages/core/src/financeiro/portasRepositorio.ts

import type { ErroApp, Result } from "../kernel/index.js";
import type { ContaFinanceira, ListarContasFinanceirasInput, ResumoFinanceiro, ObterResumoFinanceiroInput } from "./tipos.js";

/**
 * Porta de consulta financeira derivada de transações comerciais.
 *
 * Importante: este módulo não possui tabela própria na v1. O adapter real deve
 * consultar a tabela de transações e projetar os dados para visão financeira.
 */
export interface FinanceiroTransacoesConsultaRepositorio {
  obterResumoFinanceiro(input: ObterResumoFinanceiroInput): Promise<Result<ResumoFinanceiro, ErroApp>>;

  listarContasReceber(input: ListarContasFinanceirasInput): Promise<Result<ContaFinanceira[], ErroApp>>;

  listarContasPagar(input: ListarContasFinanceirasInput): Promise<Result<ContaFinanceira[], ErroApp>>;
}
