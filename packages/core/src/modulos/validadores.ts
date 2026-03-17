import type { Result } from "../result";
import { wrapOk } from "../result";
import type { ErroApp } from "../erros";
import { erroLocatarioIdInvalido, erroModuloCodigoInvalido} from "./erros";
import type { ListarModulosHabilitadosInput, ModuloEstaHabilitadoInput} from "./tipos";
import { validarIdGenerico, validarTextoObrigatorio } from "../utils";

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