// packages/core/src/financeiro/tipos.ts

import type { ErroApp, Result } from "../kernel/index.js";
import type { LocatarioId } from "../locatarios/index.js";
import type { ClienteId } from "../clientes/index.js";
import type { FornecedorId } from "../fornecedores/index.js";
import type { TransacaoId } from "../vendas/index.js";

export type TipoContaFinanceira = "RECEBER" | "PAGAR";
export type StatusContaFinanceira = "ABERTO" | "LIQUIDADO";
export type FiltroStatusContaFinanceira = StatusContaFinanceira | "TODOS";

export type ContaFinanceira = {
  transacaoId: TransacaoId;
  locatarioId: LocatarioId;
  tipo: TipoContaFinanceira;
  status: StatusContaFinanceira;
  clienteId: ClienteId | null;
  fornecedorId: FornecedorId | null;
  descricao: string | null;
  valor: number;
  vencimentoEm: Date;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type PeriodoFinanceiro = {
  inicio?: Date | null;
  fim?: Date | null;
};

export type ObterResumoFinanceiroInput = {
  locatarioId: LocatarioId;
  hoje?: Date;
  periodo?: PeriodoFinanceiro;
};

export type ResumoFinanceiro = {
  locatarioId: LocatarioId;
  totalAReceber: number;
  totalAPagar: number;
  saldoPrevisto: number;
  totalRecebidoPeriodo: number;
  totalPagoPeriodo: number;
  totalVencidoReceber: number;
  totalVencidoPagar: number;
  quantidadeVencidosReceber: number;
  quantidadeVencidosPagar: number;
  geradoEm: Date;
};

export type ObterResumoFinanceiroOutput = {
  resumo: ResumoFinanceiro;
};

export type ObterResumoFinanceiroResult = Promise<Result<ObterResumoFinanceiroOutput, ErroApp>>;

export type ListarContasFinanceirasInput = {
  locatarioId: LocatarioId;
  status?: FiltroStatusContaFinanceira;
  vencidas?: boolean;
  dataInicial?: Date | null;
  dataFinal?: Date | null;
  cursor?: TransacaoId;
  limite?: number;
};

export type ListarContasFinanceirasOutput = {
  itens: ContaFinanceira[];
};

export type ListarContasFinanceirasResult = Promise<Result<ListarContasFinanceirasOutput, ErroApp>>;
