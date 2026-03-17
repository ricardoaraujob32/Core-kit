// packages/core/src/tokens/validadores.ts

import { ErroApp } from "../erros";
import { Result, wrapOk } from "../result";
import { validarData, validarIdGenerico, validarNumeroPositivo, validarTextoObrigatorio } from "../utils";
import { entradaInvalida, tokenInvalido } from "./erros";
import { TokenId, TokenTipo } from "./tipos";

function mapearErroToken(resultado: Result<string | Date, ErroApp>, campo: string, valor?: unknown): any {
  if (resultado.ok) return resultado;
  return tokenInvalido({ campo, valor });
}

function mapearErroEntrada(resultado: Result<string | Date | number, ErroApp>, campo: string, valor?: unknown): any {
  if (resultado.ok) return resultado;
  return entradaInvalida({ campo, valor });
}

export function validarTokenId(tokenId: TokenId): Result<string, ErroApp> {
  return mapearErroToken(
    validarIdGenerico(tokenId, "tokenId"),
    "tokenId",
    tokenId,
  );
}

export function validarTokenBruto(tokenBruto: string): Result<string, ErroApp> {
  return mapearErroEntrada(
    validarTextoObrigatorio(tokenBruto, "tokenBruto", 1),
    "tokenBruto",
    tokenBruto,
  );
}

export function validarTtl(ttlMs: number): Result<number, ErroApp> {
  const res = validarNumeroPositivo(ttlMs, "ttlMs");
  if (res.ok) return res;
  return entradaInvalida({ campo: "ttlMs", valor: ttlMs });
}

export function validarAgora(agora: Date): Result<Date, ErroApp> {
  const res = validarData(agora, "agora");
  if (res.ok) return res;
  return entradaInvalida({ campo: "agora" });
}

export function validarHashToken(hashToken: string): Result<string, ErroApp> {
  return mapearErroToken(
    validarTextoObrigatorio(hashToken, "hashToken", 16),
    "hashToken",
    hashToken,
  );
}

export function validarTokenTipo(tipo: TokenTipo): Result<TokenTipo, ErroApp> {
  if (!["ACESSO", "REFRESH", "API", "RESET_SENHA"].includes(tipo)) {
    return tokenInvalido({ campo: "tipo" });
  }

  return wrapOk(tipo);
}

export function validarExpiraEm(expiraEm: Date): Result<Date, ErroApp> {
  const res = validarData(expiraEm, "expiraEm");
  if (res.ok) return res;
  return tokenInvalido({ campo: "expiraEm" });
}