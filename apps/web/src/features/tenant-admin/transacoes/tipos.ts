// apps/web/src/features/tenant-admin/transacoes/tipos.ts

export type TipoTransacao = "VENDA" | "COMPRA";

export type StatusTransacao =
  | "ABERTA"
  | "EM_PROCESSAMENTO"
  | "AGUARDANDO_PAGAMENTO"
  | "ENVIADA"
  | "CONCLUIDA"
  | "CANCELADA";

export type TransacaoItem = {
  itemTransacaoId: string;
  transacaoId: string;
  locatarioId: string;
  produtoId: string;
  estoqueId?: string | null;
  descricao?: string | null;
  tipoProduto: "PRODUTO" | "SERVICO";
  quantidade: number;
  valorUnitario: number;
  valorDesconto: number;
  valorTotal: number;
  movimentaEstoque: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
};

export type Transacao = {
  transacaoId: string;
  locatarioId: string;
  tipo: TipoTransacao;
  clienteId?: string | null;
  fornecedorId?: string | null;
  status: StatusTransacao;
  valorSubtotal: number;
  valorDesconto: number;
  valorAcrescimo: number;
  valorTotal: number;
  observacao?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
  canceladoEm?: string | null;
  itens?: TransacaoItem[];
};

export type ListarTransacoesResponse = {
  itens: Transacao[];
};

export type ObterTransacaoResponse = {
  item: Transacao & {
    itens: TransacaoItem[];
  };
};

export type CriarTransacaoResponse = {
  item: {
    transacaoId: string;
  };
};

export type CriarVendaInput = {
  clienteId?: string | null;
  observacao?: string | null;
};

export type CriarCompraInput = {
  fornecedorId?: string | null;
  observacao?: string | null;
};

export type AdicionarItemTransacaoInput = {
  produtoId: string;
  estoqueId?: string | null;
  descricao?: string | null;
  quantidade: number;
  valorUnitario: number;
  valorDesconto?: number;
};

export type AdicionarItemTransacaoResponse = {
  item: TransacaoItem;
};

export type AtualizarItemTransacaoInput = {
  descricao?: string | null;
  quantidade?: number;
  valorUnitario?: number;
  valorDesconto?: number;
};

export type AtualizarItemTransacaoResponse = {
  item: {
    item: TransacaoItem;
    transacao: Transacao;
  };
};

export type RemoverItemTransacaoResponse = {
  item: Transacao;
};

export type ConfirmarTransacaoResponse = {
  item: Transacao;
};

export type CancelarTransacaoInput = {
  motivo?: string | null;
};

export type CancelarTransacaoResponse = {
  item: Transacao;
};