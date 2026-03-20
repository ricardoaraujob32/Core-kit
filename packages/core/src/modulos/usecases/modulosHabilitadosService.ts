// packages/core/src/modulos/usecases/modulosHabilitadosService.ts

import { ErroApp, Result, wrapOk } from "../../kernel";
import { erroModuloNaoHabilitado } from "../erros";
import { ModulosHabilitadosRepositorio } from "../portasRepositorio";
import { ListarModulosHabilitadosInput, ListarModulosHabilitadosOutput, ModuloEstaHabilitadoInput, ModuloEstaHabilitadoOutput } from "../tipos";
import { validarListarModulosHabilitadosInput, validarModuloEstaHabilitadoInput } from "../validadores";

/**
 * 
 */
export type ModulosHabilitadosService = {
  listarModulosHabilitados(
    input: ListarModulosHabilitadosInput,
  ): Promise<Result<ListarModulosHabilitadosOutput, ErroApp>>;

  moduloEstaHabilitado(
    input: ModuloEstaHabilitadoInput,
  ): Promise<Result<ModuloEstaHabilitadoOutput, ErroApp>>;

  exigirModuloHabilitado(
    input: ModuloEstaHabilitadoInput,
  ): Promise<Result<ModuloEstaHabilitadoOutput, ErroApp>>;
};

/**
 * 
 */
export type CriarModulosHabilitadosServiceDeps = {
  repositorio: ModulosHabilitadosRepositorio;
};

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnListarModulosHabilitados(
  deps: CriarModulosHabilitadosServiceDeps,
): ModulosHabilitadosService {
  return {
    async listarModulosHabilitados(input) {
      const validado = validarListarModulosHabilitadosInput(input);
      if (!validado.ok) return validado;

      const modulosResult = await deps.repositorio.listarPorLocatario(
        validado.value.locatarioId,
      );
      if (!modulosResult.ok) return modulosResult;

      return wrapOk({
        locatarioId: validado.value.locatarioId,
        modulos: modulosResult.value,
      });
    },

    async moduloEstaHabilitado(input) {
      const validado = validarModuloEstaHabilitadoInput(input);
      if (!validado.ok) return validado;

      const modulosResult = await deps.repositorio.listarPorLocatario(
        validado.value.locatarioId,
      );
      if (!modulosResult.ok) return modulosResult;

      const encontrado = modulosResult.value.find(
        (item) => item.codigo === validado.value.codigo,
      );

      return wrapOk({
        locatarioId: validado.value.locatarioId,
        codigo: validado.value.codigo,
        habilitado: Boolean(encontrado),
        origem: encontrado?.origem,
      });
    },

    async exigirModuloHabilitado(input) {
      const statusResult = await this.moduloEstaHabilitado(input);
      if (!statusResult.ok) return statusResult;

      if (!statusResult.value.habilitado) {
        return erroModuloNaoHabilitado(
          statusResult.value.codigo,
          statusResult.value.locatarioId,
        );
      }

      return wrapOk(statusResult.value);
    },
  };
}
