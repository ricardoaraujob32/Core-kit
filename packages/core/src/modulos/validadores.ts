// packages/core/src/modulos/validadores.ts

import { ErroApp, Result, validarIdGenerico, validarTextoObrigatorio, wrapOk } from "../kernel";
import { erroLocatarioIdInvalido, erroModuloCodigoInvalido } from "./erros";
import { ListarModulosHabilitadosInput, ModuloEstaHabilitadoInput } from "./tipos";

/**
 * 
 * @param input 
 * @returns 
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
 * 
 * @param input 
 * @returns 
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
