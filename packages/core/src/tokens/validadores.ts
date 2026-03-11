// import type { Result } from "../result";
import type { ErroApp } from "../erros";
import { LocatarioId } from "../locatarios/tipos";
import { Result, wrapOk } from "../result";
import { UsuarioId } from "../usuarios";
import { entradaInvalida } from "./erros";

export function validarLocatarioId(locatarioId: LocatarioId): Result<string, ErroApp> {
  if (typeof locatarioId !== "string" || locatarioId.trim().length === 0) {
    return entradaInvalida({ campo: "locatarioId" });
  }

  return wrapOk(locatarioId.trim());
}

export function validarUsuarioId(usuarioId: UsuarioId): Result<string, ErroApp> {
  if (typeof usuarioId !== "string" || usuarioId.trim().length === 0) {
    return entradaInvalida({ campo: "usuarioId" });
  }

  return wrapOk(usuarioId.trim());
}

export function validarTokenBruto(tokenBruto: string): Result<string, ErroApp> {
  if (typeof tokenBruto !== "string" || tokenBruto.trim().length === 0) {
    return entradaInvalida({ campo: "tokenBruto" });
  }

  return wrapOk(tokenBruto.trim());
}

export function validarTtl(ttlMs: number): Result<number, ErroApp> {
  if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
    return entradaInvalida({ campo: "ttlMs", valor: ttlMs });
  }

  return wrapOk(ttlMs);
}

export function validarAgora(agora: Date): Result<Date, ErroApp> {
  if (!(agora instanceof Date) || Number.isNaN(agora.getTime())) {
    return entradaInvalida({ campo: "agora" });
  }

  return wrapOk(agora);
}