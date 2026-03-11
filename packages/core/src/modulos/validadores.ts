import type { Result } from "../result";
import { wrapOk } from "../result";
import type { ErroApp } from "../erros";
import { erroLocatarioIdInvalido, erroModuloCodigoInvalido} from "./erros";
import type { ListarModulosHabilitadosInput, ModuloEstaHabilitadoInput} from "./tipos";

function textoNaoVazio(valor: unknown): valor is string {
  return typeof valor === "string" && valor.trim().length > 0;
}

export function validarListarModulosHabilitadosInput(
  input: ListarModulosHabilitadosInput,
): Result<ListarModulosHabilitadosInput, ErroApp> {
  if (!textoNaoVazio(input.locatarioId)) {
    return erroLocatarioIdInvalido(input.locatarioId);
  }

  return wrapOk({
    locatarioId: input.locatarioId.trim(),
  });
}

export function validarModuloEstaHabilitadoInput(
  input: ModuloEstaHabilitadoInput,
): Result<ModuloEstaHabilitadoInput, ErroApp> {
  if (!textoNaoVazio(input.locatarioId)) {
    return erroLocatarioIdInvalido(input.locatarioId);
  }

  if (!textoNaoVazio(input.codigo)) {
    return erroModuloCodigoInvalido(input.codigo);
  }

  return wrapOk({
    locatarioId: input.locatarioId.trim(),
    codigo: input.codigo.trim().toUpperCase(),
  });
}