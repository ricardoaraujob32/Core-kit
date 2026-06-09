// packages/core/src/vendas/portasRepositorio.ts

import type { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import type { ProdutoId } from "../produtos";
import type { EstoqueId, HistoricoTransacaoComercial, ItemTransacaoComercial, MovimentoEstoqueComercial, StatusTransacaoComercial, TipoTransacaoComercial, TransacaoComercial, TransacaoId, ItemTransacaoId } from "./tipos";

/**
 * 
 */
export interface VendasRepositorio {

  /**
   * 
   * @param transacao 
   */
  criarTransacao(transacao: TransacaoComercial): Promise<Result<{ transacaoId: TransacaoId }, ErroApp>>;

  /**
   * 
   * @param params 
   */
  buscarTransacaoPorId(params: { locatarioId: LocatarioId; transacaoId: TransacaoId }): Promise<Result<TransacaoComercial | null, ErroApp>>;
  
  /**
   * 
   * @param params 
   */
  listarTransacoes(params: { locatarioId: LocatarioId; tipo?: TipoTransacaoComercial; status?: StatusTransacaoComercial; cursor?: TransacaoId; limite?: number }): Promise<Result<TransacaoComercial[], ErroApp>>;
  
  /**
   * 
   * @param transacao 
   */
  atualizarTransacao(transacao: TransacaoComercial): Promise<Result<TransacaoComercial, ErroApp>>;
  
  /**
   * 
   * @param item 
   */
  criarItem(item: ItemTransacaoComercial): Promise<Result<{ itemTransacaoId: ItemTransacaoId }, ErroApp>>;
  
  /**
   * 
   * @param params 
   */
  buscarItemPorId(params: { locatarioId: LocatarioId; transacaoId: TransacaoId; itemTransacaoId: ItemTransacaoId }): Promise<Result<ItemTransacaoComercial | null, ErroApp>>;
  
  /**
   * 
   * @param params 
   */
  listarItens(params: { locatarioId: LocatarioId; transacaoId: TransacaoId }): Promise<Result<ItemTransacaoComercial[], ErroApp>>;

  /**
   * 
   * @param item 
   */
  atualizarItem(item: ItemTransacaoComercial): Promise<Result<ItemTransacaoComercial, ErroApp>>;

  /**
   * 
   * @param historico 
   */
  criarHistorico(historico: HistoricoTransacaoComercial): Promise<Result<{ historicoId: string }, ErroApp>>;

  /**
   * 
   * @param params 
   */
  listarHistorico(params: { locatarioId: LocatarioId; transacaoId: TransacaoId }): Promise<Result<HistoricoTransacaoComercial[], ErroApp>>;

  listarItensPorTransacao(params: {
    locatarioId: LocatarioId;
    transacaoId: TransacaoId;
  }): Promise<Result<ItemTransacaoComercial[], ErroApp>>;

  removerItem(params: {
    locatarioId: LocatarioId;
    transacaoId: TransacaoId;
    itemTransacaoId: ItemTransacaoId;
  }): Promise<Result<void, ErroApp>>;

  registrarMovimentoEstoque(movimento: {
    locatarioId: LocatarioId;
    estoqueId: EstoqueId | null;
    produtoId: ProdutoId;
    transacaoId: TransacaoId;
    itemTransacaoId: ItemTransacaoId;
    tipo: "ENTRADA" | "SAIDA";
    quantidade: number;
    ocorridoEm: Date;
  }): Promise<Result<void, ErroApp>>;
}

/**
 * 
 */
export interface EstoquePadraoConsultaPorta {
  /**
   * 
   * @param params 
   */
  obterEstoquePadrao(params: { locatarioId: LocatarioId }): Promise<Result<{ estoqueId: EstoqueId } | null, ErroApp>>;
}

/**
 * 
 */
export interface MovimentacaoEstoquePorta {
  /**
   * 
   * @param movimento 
   */
  registrarMovimento(movimento: MovimentoEstoqueComercial): Promise<Result<void, ErroApp>>;
}

/**
 * 
 */
export interface ProdutoComercialConsultaPorta {
  /**
   * 
   * @param params 
   */
  buscarProdutoParaTransacao(params: { locatarioId: LocatarioId; produtoId: ProdutoId }): Promise<Result<{ produtoId: ProdutoId; nome: string; tipo: "PRODUTO" | "SERVICO"; status: "ATIVO" | "INATIVO" | "EXCLUIDO"; precoVenda: number; custoReferencia: number | null }, ErroApp>>;
}
