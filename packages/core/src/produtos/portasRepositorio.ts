// packages/core/src/produtos/portasRepositorio.ts

import type { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import type { Produto, ProdutoId, TipoProduto } from "./tipos";

/**
 * 
 */
export interface ProdutosRepositorio {
  /**
   * 
   * @param produto 
   */
  criar(produto: Produto): Promise<Result<{ produtoId: ProdutoId }, ErroApp>>;
  
  /**
   * 
   * @param params 
   */
  buscarPorId(params: { locatarioId: LocatarioId; produtoId: ProdutoId }): Promise<Result<Produto | null, ErroApp>>;
  
  /**
   * 
   * @param params 
   */
  listarPorLocatario(params: { locatarioId: LocatarioId; tipo?: TipoProduto; cursor?: ProdutoId; limite?: number }): Promise<Result<Produto[], ErroApp>>;
  
  /**
   * 
   * @param produto 
   */
  atualizar(produto: Produto): Promise<Result<Produto, ErroApp>>;
}
