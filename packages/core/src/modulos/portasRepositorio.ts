// packages/core/src/modulos/portasRepositorio.ts

import { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { ModuloHabilitado } from "./tipos";

/**
 * 
 */
export interface ModulosHabilitadosRepositorio {
  listarPorLocatario(locatarioId: LocatarioId): Promise<Result<ModuloHabilitado[], ErroApp>>;
}
