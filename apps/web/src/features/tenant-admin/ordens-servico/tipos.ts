// apps/web/src/features/tenant-admin/ordens-servico/tipos.ts

export type StatusOrdemServico =
  | "ABERTA"
  | "EM_ANDAMENTO"
  | "AGUARDANDO"
  | "CONCLUIDA"
  | "CANCELADA";

export type OrdemServico = {
  ordemServicoId: string;
  locatarioId: string;
  clienteId: string | null;
  servicoId?: string | null;
  transacaoId: string | null;
  status: StatusOrdemServico;
  titulo: string;
  descricao: string | null;
  abertaEm: string;
  fechadaEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

export type CriarOrdemServicoInput = {
  usuarioId: string;
  clienteId?: string | null;
  servicoId?: string | null;
  titulo: string;
  descricao?: string | null;
};

export type AtualizarOrdemServicoInput = Partial<CriarOrdemServicoInput>;

export type GerarVendaOrdemServicoInput = {
  produtoId: string;
  valorTotal: number;
  vencimentoEm: string;
  observacao?: string | null;
};
