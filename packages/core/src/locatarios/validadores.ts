// packages/core/src/locatarios/validadores.ts

import { ErroApp, Result, validarIdGenerico, validarTextoObrigatorio } from "../kernel";
import { locatarioInvalido } from "./erros";
import { LocatarioId } from "./tipos";

/**
 * 
 * @param resultado 
 * @param campo 
 * @param valor 
 * @returns 
 */
function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
  if (resultado.ok) return resultado;
  return locatarioInvalido({ campo, valor });
}

/**
 * 
 * @param nome 
 * @returns 
 */
export function validarNomeLocatario(nome: string): Result<string, ErroApp> {
  return mapearErro(
    validarTextoObrigatorio(nome, "nome", 2),
    "nome",
    nome,
  );
}

/**
 * 
 * @param locatarioId 
 * @returns 
 */
export function validarLocatarioId(locatarioId: LocatarioId): Result<string, ErroApp> {
  return mapearErro(
    validarIdGenerico(locatarioId, "locatarioId"),
    "locatarioId",
    locatarioId,
  );
}
