// packages/core/src/modulos/usecases/exigirModuloHabilitado.ts

import { wrapOk } from "../../kernel";
import { erroModuloNaoHabilitado } from "../erros";
import { ModulosHabilitadosRepositorio } from "../portasRepositorio";
import { ModuloEstaHabilitadoInput, ModuloEstaHabilitadoOutput, ModuloEstaHabilitadoResult } from "../tipos";
import { createFnModuloEstaHabilitado } from "./moduloEstaHabilitado";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por exigir que um módulo esteja habilitado
 * para um determinado locatário.
 *
 * Este caso de uso reutiliza a verificação de habilitação e converte
 * a ausência do módulo em erro explícito de domínio.
 */

/**
 * Cria a função de caso de uso para exigir habilitação de módulo.
 *
 * @param deps Dependência de acesso ao repositório de módulos habilitados.
 * @returns Função de caso de uso `exigirModuloHabilitado`.
 */
export function createFnExigirModuloHabilitado(deps: {repositorio: ModulosHabilitadosRepositorio}) {
  const moduloEstaHabilitado = createFnModuloEstaHabilitado(deps);
    /**
 * Exige que um módulo esteja habilitado para o locatário informado.
 *
 * Fluxo:
 * - delega a verificação para `moduloEstaHabilitado`;
 * - propaga falhas de validação ou consulta;
 * - converte a ausência do módulo em erro específico;
 * - devolve o status positivo quando o módulo está habilitado.
 *
 * @param input Dados da exigência de habilitação.
 * @returns `Ok(status)` quando o módulo está habilitado,
 * ou `Err(ErroApp)` em caso de falha.
 */
  return async function exigirModuloHabilitado(input: ModuloEstaHabilitadoInput): ModuloEstaHabilitadoResult {
    const statusResult = await moduloEstaHabilitado(input);
    if (!statusResult.ok) return statusResult;

    if (!statusResult.value.habilitado) {
      return erroModuloNaoHabilitado(
        statusResult.value.codigo,
        statusResult.value.locatarioId,
      );
    }

    return wrapOk<ModuloEstaHabilitadoOutput>(statusResult.value);
  };
}
