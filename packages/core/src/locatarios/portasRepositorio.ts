// packages/core/src/locatarios/portasRepositorio.ts

import type { ErroApp, Result } from "../kernel";
import type { Locatario, LocatarioId } from "./tipos";

/**
 * 
 */
export interface LocatariosRepositorio {
  criar(params: {
    locatarioId: LocatarioId;
    nome: string;
    status: "ATIVO";
    criadoEm: Date;
  }): Promise<Result<{ locatarioId: LocatarioId }, ErroApp>>;

  buscarPorId(params: {locatarioId: LocatarioId}): Promise<Result<Locatario | null, ErroApp>>;

  listar(): Promise<Result<Locatario[], ErroApp>>;
}
