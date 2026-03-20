// packages/core/src/tokens/validadores.ts

import { ErroApp, Result, validarData, validarIdGenerico, validarNumeroPositivo, validarTextoObrigatorio, wrapOk } from "../kernel";
import { entradaInvalida, tokenInvalido } from "./erros";
import { TokenId, TokenTipo } from "./tipos";

/**
 * 
 * @param resultado 
 * @param campo 
 * @param valor 
 * @returns 
 */
function mapearErroToken(resultado: Result<string | Date, ErroApp>, campo: string, valor?: unknown): any {
  if (resultado.ok) return resultado;
  return tokenInvalido({ campo, valor });
}

/**
 * 
 * @param resultado 
 * @param campo 
 * @param valor 
 * @returns 
 */
function mapearErroEntrada(resultado: Result<string | Date | number, ErroApp>, campo: string, valor?: unknown): any {
  if (resultado.ok) return resultado;
  return entradaInvalida({ campo, valor });
}

/**
 * 
 * @param tokenId 
 * @returns 
 */
export function validarTokenId(tokenId: TokenId): Result<string, ErroApp> {
  return mapearErroToken(
    validarIdGenerico(tokenId, "tokenId"),
    "tokenId",
    tokenId,
  );
}

/**
 * 
 * @param tokenBruto 
 * @returns 
 */
export function validarTokenBruto(tokenBruto: string): Result<string, ErroApp> {
  return mapearErroEntrada(
    validarTextoObrigatorio(tokenBruto, "tokenBruto", 1),
    "tokenBruto",
    tokenBruto,
  );
}

/**
 * 
 * @param ttlMs 
 * @returns 
 */
export function validarTtl(ttlMs: number): Result<number, ErroApp> {
  const res = validarNumeroPositivo(ttlMs, "ttlMs");
  if (res.ok) return res;
  return entradaInvalida({ campo: "ttlMs", valor: ttlMs });
}

/**
 * 
 * @param agora 
 * @returns 
 */
export function validarAgora(agora: Date): Result<Date, ErroApp> {
  const res = validarData(agora, "agora");
  if (res.ok) return res;
  return entradaInvalida({ campo: "agora" });
}

/**
 * 
 * @param hashToken 
 * @returns 
 */
export function validarHashToken(hashToken: string): Result<string, ErroApp> {
  return mapearErroToken(
    validarTextoObrigatorio(hashToken, "hashToken", 16),
    "hashToken",
    hashToken,
  );
}

/**
 * 
 * @param tipo 
 * @returns 
 */
export function validarTokenTipo(tipo: TokenTipo): Result<TokenTipo, ErroApp> {
  if (!["ACESSO", "REFRESH", "API", "RESET_SENHA"].includes(tipo)) {
    return tokenInvalido({ campo: "tipo" });
  }

  return wrapOk(tipo);
}

/**
 * 
 * @param expiraEm 
 * @returns 
 */
export function validarExpiraEm(expiraEm: Date): Result<Date, ErroApp> {
  const res = validarData(expiraEm, "expiraEm");
  if (res.ok) return res;
  return tokenInvalido({ campo: "expiraEm" });
}
