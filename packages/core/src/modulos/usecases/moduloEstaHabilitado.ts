// packages/core/src/modulos/usecases/moduloEstaHabilitado.ts

import { wrapOk } from "../../kernel/index.js";
import { ModulosHabilitadosRepositorio } from "../portasRepositorio.js";
import { ModuloEstaHabilitadoInput, ModuloEstaHabilitadoOutput, ModuloEstaHabilitadoResult } from "../tipos.js";
import { validarModuloEstaHabilitadoInput } from "../validadores.js";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por verificar se um módulo específico
 * está habilitado para um determinado locatário.
 *
 * Este caso de uso faz a ponte entre a listagem de módulos habilitados
 * e a decisão booleana de disponibilidade de um módulo.
 */

/**
 * Cria a função de caso de uso para verificar habilitação de módulo.
 *
 * @param deps Dependência de acesso ao repositório de módulos habilitados.
 * @returns Função de caso de uso `moduloEstaHabilitado`.
 */
export function createFnModuloEstaHabilitado(deps: {
  repositorio: ModulosHabilitadosRepositorio;
}) {
    /**
 * Verifica se um módulo está habilitado para o locatário informado.
 *
 * Fluxo:
 * - valida a entrada;
 * - consulta os módulos habilitados do locatário;
 * - procura o módulo pelo código informado;
 * - devolve o status de habilitação e a origem, quando existente.
 *
 * @param input Dados da verificação de habilitação.
 * @returns `Ok({ locatarioId, codigo, habilitado, origem? })` em caso de sucesso,
 * ou `Err(ErroApp)` em caso de falha.
 */
  return async function moduloEstaHabilitado(input: ModuloEstaHabilitadoInput): ModuloEstaHabilitadoResult {
    const validado = validarModuloEstaHabilitadoInput(input);
    if (!validado.ok) return validado;

    const modulosResult = await deps.repositorio.listarPorLocatario(
      validado.value.locatarioId,
    );
    if (!modulosResult.ok) return modulosResult;

    const encontrado = modulosResult.value.find(
      (item) => item.codigo.toUpperCase() === validado.value.codigo,
    );

    return wrapOk<ModuloEstaHabilitadoOutput>({
      locatarioId: validado.value.locatarioId,
      codigo: validado.value.codigo,
      habilitado: Boolean(encontrado),
      origem: encontrado?.origem,
    });
  };
}
