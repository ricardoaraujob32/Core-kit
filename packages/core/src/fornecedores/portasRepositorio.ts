import type { ErroApp, Result } from "../kernel/index.js";
import { LocatarioId } from "../locatarios/index.js";
import type { Fornecedor, FornecedorId } from "./tipos.js";

/**
 * 
 */
export interface FornecedoresRepositorio {
  /**
   * 
   * @param fornecedor 
   */
  criar(fornecedor: Fornecedor): Promise<Result<{ fornecedorId: FornecedorId }, ErroApp>>;

  /**
   * 
   * @param params 
   */
  buscarPorId(params: { locatarioId: LocatarioId; fornecedorId: FornecedorId }): Promise<Result<Fornecedor | null, ErroApp>>;

  /**
   * 
   * @param params 
   */
  listarPorLocatario(params: { locatarioId: LocatarioId; cursor?: FornecedorId; limite?: number }): Promise<Result<Fornecedor[], ErroApp>>;

  /**
   * 
   * @param fornecedor 
   */
  atualizar(fornecedor: Fornecedor): Promise<Result<Fornecedor, ErroApp>>;
}
