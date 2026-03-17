// packages/core/src/auth/validadores.ts

import { wrapOk } from "../kernel/result";
import type { Result } from "../kernel/result";
import type { ErroApp } from "../kernel/erros";
import { authEntradaInvalida } from "./erros";

function mapearErro(
  resultado: Result<string, ErroApp>,
  campo: string,
  valor?: unknown,
): Result<string, ErroApp> {
  if (resultado.ok) return resultado;
  return authEntradaInvalida({ campo, valor });
}

export function validarEmailAuth(
  email: string,
): Result<string, ErroApp> {
  return mapearErro(
    validarEmail(email, "email"),
    "email",
    email,
  );
}

export function validarSenha(
  senha: string,
): Result<string, ErroApp> {
  return mapearErro(
    validarTextoObrigatorio(senha, "senha", 1),
    "senha",
    senha,
  );
}

export function validarLocatarioIdAuth(
  locatarioId: string,
): Result<string, ErroApp> {
  return mapearErro(
    validarIdGenerico(locatarioId, "locatarioId"),
    "locatarioId",
    locatarioId,
  );
}

export function validarTokenNaoVazio(
  token: string,
): Result<string, ErroApp> {
  return mapearErro(
    validarTextoObrigatorio(token, "token", 1),
    "token",
    token,
  );
}
