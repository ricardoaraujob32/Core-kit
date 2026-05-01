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
  itemId: string;
  transacaoId: string;
  produtoId: string;
  nomeProduto?: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  criadoEm?: string;
  atualizadoEm?: string;
};

export type Transacao = {
  transacaoId: string;
  locatarioId: string;
  tipo: TipoTransacao;
  status: StatusTransacao;
  clienteId?: string | null;
  fornecedorId?: string | null;
  valorTotal?: number;
  itens?: TransacaoItem[];
  criadoEm?: string;
  atualizadoEm?: string;
  confirmadoEm?: string | null;
  canceladoEm?: string | null;
};

export type ListarTransacoesResponse = {
  itens: Transacao[];
};

export type ObterTransacaoResponse = {
  item: Transacao;
};

export type CriarVendaInput = {
  clienteId?: string | null;
};

export type CriarCompraInput = {
  fornecedorId?: string | null;
};

export type CriarTransacaoResponse = {
  item: Transacao;
};

export type AdicionarItemTransacaoInput = {
  produtoId: string;
  quantidade: number;
  valorUnitario: number;
};

export type AdicionarItemTransacaoResponse = {
  item: TransacaoItem;
};

export type AtualizarItemTransacaoInput = {
  quantidade?: number;
  valorUnitario?: number;
};

export type AtualizarItemTransacaoResponse = {
  item: TransacaoItem;
};

export type RemoverItemTransacaoResponse = {
  sucesso?: boolean;
};

export type ConfirmarTransacaoResponse = {
  item: Transacao;
};

export type CancelarTransacaoInput = {
  motivo?: string;
};

export type CancelarTransacaoResponse = {
  item: Transacao;
};