// packages/core/src/produtos/portasRepositorio.ts

import type { ErroApp, Result } from "../kernel/index.js";
import { LocatarioId } from "../locatarios/index.js";
import type { Produto, ProdutoId, TipoProduto } from "./tipos.js";

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
