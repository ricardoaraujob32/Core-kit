// packages/core/src/modulos/validadores.ts

import { ErroApp, Result, validarIdGenerico, validarTextoObrigatorio, wrapOk } from "../kernel/index.js";
import { erroLocatarioIdInvalido, erroModuloCodigoInvalido } from "./erros.js";
import { ListarModulosHabilitadosInput, ModuloEstaHabilitadoInput } from "./tipos.js";

/**
 * Valida a entrada da operação que lista módulos habilitados para um locatário.
 *
 * Regras atuais:
 * - `locatarioId` deve ser um ID textual válido.
 *
 * @param input Entrada recebida pelo caso de uso.
 * @returns `Ok(inputNormalizado)` quando a estrutura mínima é válida.
 */
export function validarListarModulosHabilitadosInput(
  input: ListarModulosHabilitadosInput,
): Result<ListarModulosHabilitadosInput, ErroApp> {
  const locatarioId = validarIdGenerico(input.locatarioId, "locatarioId");
  if (!locatarioId.ok) {
    return erroLocatarioIdInvalido(input.locatarioId);
  }

  return wrapOk({
    locatarioId: locatarioId.value,
  });
}

/**
 * Valida a entrada da operação que verifica se um módulo está habilitado.
 *
 * Regras atuais:
 * - `locatarioId` deve ser um ID textual válido;
 * - `codigo` deve ser texto obrigatório;
 * - o código retornado é normalizado para maiúsculas.
 *
 * @param input Entrada recebida pela operação.
 * @returns `Ok(inputNormalizado)` quando os campos atendem ao contrato mínimo.
 */
export function validarModuloEstaHabilitadoInput(
  input: ModuloEstaHabilitadoInput,
): Result<ModuloEstaHabilitadoInput, ErroApp> {
  const locatarioId = validarIdGenerico(input.locatarioId, "locatarioId");
  if (!locatarioId.ok) {
    return erroLocatarioIdInvalido(input.locatarioId);
  }

  const codigo = validarTextoObrigatorio(input.codigo, "codigo", 1);
  if (!codigo.ok) {
    return erroModuloCodigoInvalido(input.codigo);
  }

  return wrapOk({
    locatarioId: locatarioId.value,
    codigo: codigo.value.toUpperCase(),
  });
}
