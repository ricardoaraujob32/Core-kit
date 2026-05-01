// packages/core/src/clientes/portasRepositorio.ts

import type { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import type { Cliente, ClienteId } from "./tipos";

/**
 * 
 */
export interface ClientesRepositorio {
  /**
   * 
   * @param cliente 
   */
  criar(cliente: Cliente): Promise<Result<{ clienteId: ClienteId }, ErroApp>>;

  /**
   * 
   * @param params 
   */
  buscarPorId(params: { locatarioId: LocatarioId; clienteId: ClienteId }): Promise<Result<Cliente | null, ErroApp>>;

  /**
   * 
   * @param params 
   */
  listarPorLocatario(params: { locatarioId: LocatarioId; cursor?: ClienteId; limite?: number }): Promise<Result<Cliente[], ErroApp>>;

  /**
   * 
   * @param cliente 
   */
  atualizar(cliente: Cliente): Promise<Result<Cliente, ErroApp>>;
}
