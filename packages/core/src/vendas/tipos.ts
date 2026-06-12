// packages/core/src/vendas/tipos.ts

import type { ErroApp, Result } from "../kernel";
import type { ClienteId } from "../clientes";
import type { FornecedorId } from "../fornecedores";
import type { ProdutoId, TipoProduto } from "../produtos";
import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";

export type TransacaoId = string;
export type ItemTransacaoId = string;
export type HistoricoTransacaoId = string;
export type EstoqueId = string;

export type TipoTransacaoComercial = "VENDA" | "COMPRA";
export type StatusTransacaoComercial = "RASCUNHO" | "ABERTA" | "CONFIRMADA" | "CONCLUIDA" | "CANCELADA";
export type EventoTransacaoComercial = "ABRIR" | "CONFIRMAR" | "CONCLUIR" | "CANCELAR";
export type TipoMovimentoEstoque = "ENTRADA" | "SAIDA";

export type TransacaoComercial = {
  transacaoId: TransacaoId;
  locatarioId: LocatarioId;
  tipo: TipoTransacaoComercial;
  clienteId: ClienteId | null;
  fornecedorId: FornecedorId | null;
  status: StatusTransacaoComercial;
  valorSubtotal: number;
  valorDesconto: number;
  valorAcrescimo: number;
  valorTotal: number;
  observacao: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
  canceladoEm: Date | null;
  canceladoPor: UsuarioId | null;
  canceladoMotivo: string | null;
  excluidoEm: Date | null;
  excluidoPor: UsuarioId | null;
  excluidoMotivo: string | null;
};

export type ItemTransacaoComercial = {
  itemTransacaoId: ItemTransacaoId;
  transacaoId: TransacaoId;
  locatarioId: LocatarioId;
  produtoId: ProdutoId;
  estoqueId: EstoqueId | null;
  descricao: string;
  tipoProduto: TipoProduto;
  quantidade: number;
  valorUnitario: number;
  valorSubtotal: number;
  valorAcrescimo: number;
  valorDesconto: number;
  valorTotal: number;
  movimentaEstoque: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
  excluidoEm: Date | null;
  excluidoPor: UsuarioId | null;
  excluidoMotivo: string | null;
};

export type HistoricoTransacaoComercial = {
  historicoId: HistoricoTransacaoId;
  locatarioId: LocatarioId;
  transacaoId: TransacaoId;
  evento: string;
  statusAnterior: StatusTransacaoComercial | null;
  statusNovo: StatusTransacaoComercial | null;
  resumo: string;
  detalhes: Record<string, unknown>;
  criadoEm: Date;
  criadoPor: UsuarioId | null;
};

export type MovimentoEstoqueComercial = {
  locatarioId: LocatarioId;
  estoqueId: EstoqueId;
  produtoId: ProdutoId;
  transacaoId: TransacaoId;
  itemTransacaoId: ItemTransacaoId;
  tipo: TipoMovimentoEstoque;
  quantidade: number;
  ocorridoEm: Date;
};

export type CriarVendaInput = { locatarioId: LocatarioId; clienteId?: ClienteId | null; observacao?: string | null; usuarioId?: UsuarioId | null; criadoPor?: string | null; };
export type CriarVendaOutput = { transacaoId: TransacaoId };
export type CriarVendaResult = Promise<Result<CriarVendaOutput, ErroApp>>;

export type CriarCompraInput = { locatarioId: LocatarioId; fornecedorId?: FornecedorId | null; observacao?: string | null; usuarioId?: UsuarioId | null; criadoPor?: string | null; };
export type CriarCompraOutput = { transacaoId: TransacaoId };
export type CriarCompraResult = Promise<Result<CriarCompraOutput, ErroApp>>;

export type ObterTransacaoInput = { locatarioId: LocatarioId; transacaoId: TransacaoId };
export type ObterTransacaoOutput = { transacao: TransacaoComercial; itens: ItemTransacaoComercial[]; historico: HistoricoTransacaoComercial[] };
export type ObterTransacaoResult = Promise<Result<ObterTransacaoOutput, ErroApp>>;

export type ListarTransacoesInput = { locatarioId: LocatarioId; tipo?: TipoTransacaoComercial; status?: StatusTransacaoComercial; cursor?: TransacaoId; limite?: number };
export type ListarTransacoesOutput = { itens: TransacaoComercial[] };
export type ListarTransacoesResult = Promise<Result<ListarTransacoesOutput, ErroApp>>;

export type AdicionarItemTransacaoInput = { locatarioId: LocatarioId; transacaoId: TransacaoId; produtoId: ProdutoId; quantidade: number; valorUnitario?: number; valorDesconto?: number; estoqueId?: EstoqueId | null; usuarioId?: UsuarioId | null; descricao?: string | null; valorAcrescimo?: number | undefined; };
export type AdicionarItemTransacaoOutput = { item: ItemTransacaoComercial; transacao: TransacaoComercial };
export type AdicionarItemTransacaoResult = Promise<Result<AdicionarItemTransacaoOutput, ErroApp>>;

export type ConfirmarTransacaoInput = { locatarioId: LocatarioId; transacaoId: TransacaoId; usuarioId?: UsuarioId | null };
export type ConfirmarTransacaoOutput = { transacao: TransacaoComercial };
export type ConfirmarTransacaoResult = Promise<Result<ConfirmarTransacaoOutput, ErroApp>>;

export type ConcluirTransacaoInput = { locatarioId: LocatarioId; transacaoId: TransacaoId; usuarioId?: UsuarioId | null };
export type ConcluirTransacaoOutput = { transacao: TransacaoComercial };
export type ConcluirTransacaoResult = Promise<Result<ConcluirTransacaoOutput, ErroApp>>;

export type CancelarTransacaoInput = { locatarioId: LocatarioId; transacaoId: TransacaoId; motivo?: string | null; usuarioId?: UsuarioId | null };
export type CancelarTransacaoOutput = { transacao: TransacaoComercial };
export type CancelarTransacaoResult = Promise<Result<CancelarTransacaoOutput, ErroApp>>;

export type AtualizarItemTransacaoInput = {
  locatarioId: LocatarioId;
  transacaoId: TransacaoId;
  itemTransacaoId: ItemTransacaoId;
  descricao?: string | null;
  quantidade?: number;
  valorUnitario?: number;
  valorDesconto?: number;
  valorAcrescimo?: number;
};

export type AtualizarItemTransacaoOutput = {
  item: ItemTransacaoComercial;
  transacao: TransacaoComercial;
};

export type AtualizarItemTransacaoResult = Promise<
  Result<AtualizarItemTransacaoOutput, ErroApp>
>;

export type RemoverItemTransacaoInput = {
  locatarioId: LocatarioId;
  transacaoId: TransacaoId;
  itemTransacaoId: ItemTransacaoId;
};

export type RemoverItemTransacaoOutput = {
  transacao: TransacaoComercial;
};

export type RemoverItemTransacaoResult = Promise<
  Result<RemoverItemTransacaoOutput, ErroApp>
>;
