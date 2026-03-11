import type { Result } from "../result";
import type { ErroApp } from "../erros";
import { wrapOk } from "../result";
import { emailInvalido, senhaHashInvalida, usuarioInvalido } from "./erros";

export function validarLocatarioId(
  locatarioId: string
): Result<string, ErroApp> {
  if (typeof locatarioId !== "string" || locatarioId.trim().length === 0) {
    return usuarioInvalido({ campo: "locatarioId", valor: locatarioId });
  }

  return wrapOk(locatarioId.trim());
}

export function validarUsuarioId(
  usuarioId: string
): Result<string, ErroApp> {
  if (typeof usuarioId !== "string" || usuarioId.trim().length === 0) {
    return usuarioInvalido({ campo: "usuarioId", valor: usuarioId });
  }

  return wrapOk(usuarioId.trim());
}

export function validarEmail(email: string): Result<string, ErroApp> {
  if (typeof email !== "string") {
    return emailInvalido(String(email));
  }

  const emailNorm = email.trim().toLowerCase();

  if (emailNorm.length < 5 || !emailNorm.includes("@")) {
    return emailInvalido(email);
  }

  return wrapOk(emailNorm);
}

export function validarSenhaHash(
  senhaHash: string
): Result<string, ErroApp> {
  if (typeof senhaHash !== "string" || senhaHash.trim().length === 0) {
    return senhaHashInvalida();
  }

  return wrapOk(senhaHash.trim());
}

export function validarLimite(limite?: number): Result<number, ErroApp> {
  if (limite === undefined) return wrapOk(50);

  if (!Number.isInteger(limite) || limite <= 0) {
    return usuarioInvalido({ campo: "limite", valor: limite });
  }

  return wrapOk(limite);
}