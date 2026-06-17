// apps/web/src/features/tenant-admin/financeiro/tipos.ts

export type TipoContaFinanceira = "RECEBER" | "PAGAR";
export type StatusContaFinanceira = "ABERTO" | "LIQUIDADO";
export type FiltroStatusContaFinanceira = StatusContaFinanceira | "TODOS";

export type ResumoFinanceiro = {
  locatarioId: string;
  totalAReceber: number;
  totalAPagar: number;
  saldoPrevisto: number;
  totalRecebidoPeriodo: number;
  totalPagoPeriodo: number;
  totalVencidoReceber: number;
  totalVencidoPagar: number;
  quantidadeVencidosReceber: number;
  quantidadeVencidosPagar: number;
  geradoEm: string | null;
};

export type ContaFinanceira = {
  transacaoId: string;
  locatarioId: string;
  tipo: TipoContaFinanceira;
  status: StatusContaFinanceira;
  clienteId: string | null;
  fornecedorId: string | null;
  descricao: string | null;
  valor: number;
  vencimentoEm: string | null;
  criadoEm: string | null;
  atualizadoEm: string | null;
};

export type ObterResumoFinanceiroResponse = {
  item: ResumoFinanceiro;
};

export type ListarContasFinanceirasResponse = {
  itens: ContaFinanceira[];
};

export type ListarContasFinanceirasParams = {
  status?: FiltroStatusContaFinanceira;
  vencidas?: boolean;
  dataInicial?: string;
  dataFinal?: string;
  cursor?: string;
  limite?: number;
};
