// packages/core/src/auditoria/validadores.ts

import { ErroApp, Result, validarIdGenerico, validarNumeroPositivo, validarTextoObrigatorio, wrapOk } from "../kernel";
import { erroAuditoriaInvalida } from "./erros";
import { ListarAuditoriaLocatarioInput, ListarAuditoriaPlataformaInput, RegistrarEventoLocatarioInput, 
  RegistrarEventoPlataformaInput } from "./tipos";

/**
 * 
 * @param resultado 
 * @param campo 
 * @param valor 
 * @returns 
 */
function mapearErro(resultado: Result<string | number, ErroApp>, campo: string, valor?: unknown): any {
  if (resultado.ok) return resultado;
  return erroAuditoriaInvalida({ campo, valor });
}

/**
 * 
 * @param limite 
 * @returns 
 */
function validarLimiteOpcional(limite?: number): Result<number | undefined, ErroApp> {
  if (limite === undefined) {
    return wrapOk(undefined);
  }

  const res = validarNumeroPositivo(limite, "limite");
  if (!res.ok) return erroAuditoriaInvalida({ campo: "limite", valor: limite });

  if (!Number.isInteger(limite) || limite > 500) {
    return erroAuditoriaInvalida({ campo: "limite", valor: limite });
  }

  return wrapOk(limite);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarRegistrarEventoLocatarioInput(input: RegistrarEventoLocatarioInput): Result<RegistrarEventoLocatarioInput, ErroApp> {
  const locatarioId = mapearErro(
    validarIdGenerico(input.locatarioId, "locatarioId"),
    "locatarioId",
    input.locatarioId,
  );
  if (!locatarioId.ok) return locatarioId;

  const usuarioId = mapearErro(
    validarIdGenerico(input.usuarioId, "usuarioId"),
    "usuarioId",
    input.usuarioId,
  );
  if (!usuarioId.ok) return usuarioId;

  const evento = mapearErro(
    validarTextoObrigatorio(input.evento, "evento", 1),
    "evento",
    input.evento,
  );
  if (!evento.ok) return evento;

  return wrapOk(input);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarRegistrarEventoPlataformaInput(input: RegistrarEventoPlataformaInput): Result<RegistrarEventoPlataformaInput, ErroApp> {
  const usuarioId = mapearErro(
    validarIdGenerico(input.usuarioId, "usuarioId"),
    "usuarioId",
    input.usuarioId,
  );
  if (!usuarioId.ok) return usuarioId;

  const evento = mapearErro(
    validarTextoObrigatorio(input.evento, "evento", 1),
    "evento",
    input.evento,
  );
  if (!evento.ok) return evento;

  return wrapOk(input);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarListarAuditoriaLocatarioInput(input: ListarAuditoriaLocatarioInput): Result<ListarAuditoriaLocatarioInput, ErroApp> {
  const locatarioId = mapearErro(
    validarIdGenerico(input.locatarioId, "locatarioId"),
    "locatarioId",
    input.locatarioId,
  );
  if (!locatarioId.ok) return locatarioId;

  const limite = validarLimiteOpcional(input.limite);
  if (!limite.ok) return limite;

  return wrapOk(input);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarListarAuditoriaPlataformaInput(input: ListarAuditoriaPlataformaInput): Result<ListarAuditoriaPlataformaInput, ErroApp> {
  const limite = validarLimiteOpcional(input.limite);
  if (!limite.ok) return limite;

  return wrapOk(input);
}

