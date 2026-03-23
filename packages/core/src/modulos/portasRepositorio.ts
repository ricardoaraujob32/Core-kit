// packages/core/src/modulos/portasRepositorio.ts

import { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { ModuloHabilitado } from "./tipos";

/**
 * Porta de consulta de módulos habilitados.
 *
 * Esta interface abstrai a fonte de verdade usada para resolver quais módulos
 * estão disponíveis para um locatário no momento da consulta.
 */
export interface ModulosHabilitadosRepositorio {
  /**
   * Lista os módulos habilitados para um locatário.
   *
   * @param locatarioId Identificador do locatário consultado.
   * @returns `Ok` com a coleção de módulos habilitados.
   */
  listarPorLocatario(locatarioId: LocatarioId): Promise<Result<ModuloHabilitado[], ErroApp>>;
}
