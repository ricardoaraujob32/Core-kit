// packages/core/src/auth/validadores.ts

import { ErroApp, Result, validarEmail, validarIdGenerico, validarTextoObrigatorio } from "../kernel";
import { LocatarioId } from "../locatarios";
import { authEntradaInvalida } from "./erros";

/**
 * 
 * @param resultado 
 * @param campo 
 * @param valor 
 * @returns 
 */
function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
  if (resultado.ok) return resultado;
  return authEntradaInvalida({ campo, valor });
}

/**
 * 
 * @param email 
 * @returns 
 */
export function validarEmailAuth(email: string): Result<string, ErroApp> {
  return mapearErro(validarEmail(email, "email"), "email", email);
}

/**
 * 
 * @param senha 
 * @returns 
 */
export function validarSenha(senha: string): Result<string, ErroApp> {
  return mapearErro(validarTextoObrigatorio(senha, "senha", 1), "senha", senha);
}

/**
 * 
 * @param locatarioId 
 * @returns 
 */
export function validarLocatarioIdAuth(locatarioId: LocatarioId): Result<string, ErroApp> {
  return mapearErro(validarIdGenerico(locatarioId, "locatarioId"), "locatarioId", locatarioId);
}

/**
 * 
 * @param token 
 * @returns 
 */
export function validarTokenNaoVazio(token: string): Result<string, ErroApp> {
  return mapearErro(validarTextoObrigatorio(token, "token", 1), "token", token);
}
