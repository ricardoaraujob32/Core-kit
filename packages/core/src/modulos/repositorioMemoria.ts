// packages/core/src/modulos/repositorioMemoria.ts

import type { Result } from "../result";
import { wrapOk } from "../result";
import type { ErroApp } from "../erros";
import { erroRepositorioModulos } from "./erros";
import type { ModulosHabilitadosRepositorio } from "./portasRepositorio";
import type { ModuloHabilitado } from "./tipos";
import { LocatarioId } from "../locatarios";

export type EstadoModulosHabilitadosMemoria = Record<LocatarioId, ModuloHabilitado[]>;

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