// packages/core/src/assinaturas/validadores.ts

import { ErroApp, Result, validarData, validarIdGenerico, wrapOk } from "../kernel";
import { erroAssinaturaInvalida } from "./erros";
import { AtivarAssinaturaInput, CancelarAssinaturaInput, CriarAssinaturaInput, DesvincularModuloDaAssinaturaInput,
  SuspenderAssinaturaInput, VincularModuloNaAssinaturaInput } from "./tipos";

/**
 * 
 * @param resultado 
 * @param campo 
 * @param valor 
 * @returns 
 */
function mapearErro(resultado: Result<string | Date, ErroApp>, campo: string, valor?: unknown): any {
  if (resultado.ok) return resultado;
  return erroAssinaturaInvalida({ campo, valor });
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarCriarAssinaturaInput(input: CriarAssinaturaInput): Result<CriarAssinaturaInput, unknown> {
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

/**
 * 
 * @param input 
 * @returns 
 */
export function validarAtivarAssinaturaInput(input: AtivarAssinaturaInput): Result<AtivarAssinaturaInput, unknown> {
  const assinaturaId = mapearErro(
    validarIdGenerico(input.assinaturaId, "assinaturaId"),
    "assinaturaId",
    input.assinaturaId,
  );
  if (!assinaturaId.ok) return assinaturaId;

  return wrapOk(input);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarSuspenderAssinaturaInput(input: SuspenderAssinaturaInput): Result<SuspenderAssinaturaInput, unknown> {
  const assinaturaId = mapearErro(
    validarIdGenerico(input.assinaturaId, "assinaturaId"),
    "assinaturaId",
    input.assinaturaId,
  );
  if (!assinaturaId.ok) return assinaturaId;

  return wrapOk(input);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarCancelarAssinaturaInput(input: CancelarAssinaturaInput): Result<CancelarAssinaturaInput, unknown> {
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

/**
 * 
 * @param input 
 * @returns 
 */
export function validarVincularModuloNaAssinaturaInput(input: VincularModuloNaAssinaturaInput,
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

/**
 * 
 * @param input 
 * @returns 
 */
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
