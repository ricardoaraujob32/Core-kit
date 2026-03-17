import { ErroApp } from "../erros";
import type { Result } from "../kernel/result";
import { wrapOk } from "../kernel/ROPHelpers";
import { validarData, validarIdGenerico } from "../utils";
import { erroAssinaturaInvalida } from "./erros";
import type {
  AtivarAssinaturaInput,
  CancelarAssinaturaInput,
  CriarAssinaturaInput,
  DesvincularModuloDaAssinaturaInput,
  SuspenderAssinaturaInput,
  VincularModuloNaAssinaturaInput,
} from "./tipos";

function mapearErro(resultado: Result<string | Date, ErroApp>, campo: string, valor?: unknown): any {
  if (resultado.ok) return resultado;
  return erroAssinaturaInvalida({ campo, valor });
}

export function validarCriarAssinaturaInput(
  input: CriarAssinaturaInput,
): Result<CriarAssinaturaInput, unknown> {
  const locatarioId = mapearErro(
    validarIdGenerico(input.locatarioId, "locatarioId"),
    "locatarioId",
    input.locatarioId,
  );
  if (!locatarioId.ok) return locatarioId;

  const planoId = mapearErro(
    validarIdGenerico(input.planoId, "planoId"),
    "planoId",
    input.planoId,
  );
  if (!planoId.ok) return planoId;

  if (input.iniciadaEm !== undefined) {
    const iniciadaEm = mapearErro(
      validarData(input.iniciadaEm, "iniciadaEm"),
      "iniciadaEm",
      input.iniciadaEm,
    );
    if (!iniciadaEm.ok) return iniciadaEm;
  }

  return wrapOk(input);
}

export function validarAtivarAssinaturaInput(
  input: AtivarAssinaturaInput,
): Result<AtivarAssinaturaInput, unknown> {
  const assinaturaId = mapearErro(
    validarIdGenerico(input.assinaturaId, "assinaturaId"),
    "assinaturaId",
    input.assinaturaId,
  );
  if (!assinaturaId.ok) return assinaturaId;

  return wrapOk(input);
}

export function validarSuspenderAssinaturaInput(
  input: SuspenderAssinaturaInput,
): Result<SuspenderAssinaturaInput, unknown> {
  const assinaturaId = mapearErro(
    validarIdGenerico(input.assinaturaId, "assinaturaId"),
    "assinaturaId",
    input.assinaturaId,
  );
  if (!assinaturaId.ok) return assinaturaId;

  return wrapOk(input);
}

export function validarCancelarAssinaturaInput(
  input: CancelarAssinaturaInput,
): Result<CancelarAssinaturaInput, unknown> {
  const assinaturaId = mapearErro(
    validarIdGenerico(input.assinaturaId, "assinaturaId"),
    "assinaturaId",
    input.assinaturaId,
  );
  if (!assinaturaId.ok) return assinaturaId;

  if (input.encerradaEm !== undefined) {
    const encerradaEm = mapearErro(
      validarData(input.encerradaEm, "encerradaEm"),
      "encerradaEm",
      input.encerradaEm,
    );
    if (!encerradaEm.ok) return encerradaEm;
  }

  return wrapOk(input);
}

export function validarVincularModuloNaAssinaturaInput(
  input: VincularModuloNaAssinaturaInput,
): Result<VincularModuloNaAssinaturaInput, unknown> {
  const assinaturaId = mapearErro(
    validarIdGenerico(input.assinaturaId, "assinaturaId"),
    "assinaturaId",
    input.assinaturaId,
  );
  if (!assinaturaId.ok) return assinaturaId;

  const moduloId = mapearErro(
    validarIdGenerico(input.moduloId, "moduloId"),
    "moduloId",
    input.moduloId,
  );
  if (!moduloId.ok) return moduloId;

  return wrapOk(input);
}

export function validarDesvincularModuloDaAssinaturaInput(
  input: DesvincularModuloDaAssinaturaInput,
): Result<DesvincularModuloDaAssinaturaInput, unknown> {
  const assinaturaId = mapearErro(
    validarIdGenerico(input.assinaturaId, "assinaturaId"),
    "assinaturaId",
    input.assinaturaId,
  );
  if (!assinaturaId.ok) return assinaturaId;

  const moduloId = mapearErro(
    validarIdGenerico(input.moduloId, "moduloId"),
    "moduloId",
    input.moduloId,
  );
  if (!moduloId.ok) return moduloId;

  return wrapOk(input);
}
