// packages/core/src/modulos/usecases/listarModulosHabilitados.ts

import { wrapOk } from "../../kernel";
import { ModulosHabilitadosRepositorio } from "../portasRepositorio";
import { ListarModulosHabilitadosInput, ListarModulosHabilitadosOutput, ListarModulosHabilitadosResult } from "../tipos";
import { validarListarModulosHabilitadosInput } from "../validadores";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por listar todos os módulos habilitados
 * para um determinado locatário.
 *
 * Este caso de uso expõe a visão consolidada de habilitações disponíveis
 * no contexto do locatário.
 */

/**
 * Cria a função de caso de uso para listar módulos habilitados.
 *
 * @param deps Dependência de acesso ao repositório de módulos habilitados.
 * @returns Função de caso de uso `listarModulosHabilitados`.
 */
export function createFnListarModulosHabilitados(deps: {
  repositorio: ModulosHabilitadosRepositorio;
}) {
    /**
 * Lista os módulos habilitados para o locatário informado.
 *
 * Fluxo:
 * - valida a entrada;
 * - consulta o repositório por locatário;
 * - adapta o resultado para o contrato público do módulo.
 *
 * @param input Dados da consulta de módulos habilitados.
 * @returns `Ok({ locatarioId, modulos })` em caso de sucesso,
 * ou `Err(ErroApp)` em caso de falha.
 */
  return async function listarModulosHabilitados(input: ListarModulosHabilitadosInput): ListarModulosHabilitadosResult {
    const validado = validarListarModulosHabilitadosInput(input);
    if (!validado.ok) return validado;

    const modulosResult = await deps.repositorio.listarPorLocatario(
      validado.value.locatarioId,
    );
    if (!modulosResult.ok) return modulosResult;

    return wrapOk<ListarModulosHabilitadosOutput>({
      locatarioId: validado.value.locatarioId,
      modulos: modulosResult.value.map((modulo) => ({
        ...modulo,
        codigo: modulo.codigo.toUpperCase(),
      })),
    });
  };
}
