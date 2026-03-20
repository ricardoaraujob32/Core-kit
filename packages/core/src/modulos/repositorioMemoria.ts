// packages/core/src/modulos/repositorioMemoria.ts

import { ErroApp, Result, wrapOk } from "../kernel";
import { LocatarioId } from "../locatarios";
import { erroRepositorioModulos } from "./erros";
import { ModulosHabilitadosRepositorio } from "./portasRepositorio";
import { ModuloHabilitado } from "./tipos";

/**
 * 
 */
export type EstadoModulosHabilitadosMemoria = Record<LocatarioId, ModuloHabilitado[]>;

/**
 * 
 * @param estadoInicial 
 * @returns 
 */
export function criarModulosHabilitadosRepositorioMemoria(
  estadoInicial?: EstadoModulosHabilitadosMemoria,
): ModulosHabilitadosRepositorio {
  const estado: EstadoModulosHabilitadosMemoria = { ...(estadoInicial ?? {}) };

  return {
    async listarPorLocatario(
      locatarioId: LocatarioId,
    ): Promise<Result<ModuloHabilitado[], ErroApp>> {
      try {
        const modulos = estado[locatarioId] ?? [];

        return wrapOk(
          modulos.map((item) => ({
            codigo: item.codigo.toUpperCase(),
            origem: item.origem,
          })),
        );
      } catch (error) {
        return erroRepositorioModulos(error);
      }
    },
  };
}
