import type { Result } from "../result";
import type { ErroApp } from "../erros";
import { wrapOk } from "../result";
import { locatarioInvalido } from "./erros";

export function validarNomeLocatario(
  nome: string
): Result<string, ErroApp> {
  if (typeof nome !== "string") {
    return locatarioInvalido({ campo: "nome" });
  }

  const nomeTrim = nome.trim();

  if (nomeTrim.length < 2) {
    return locatarioInvalido({ campo: "nome", valor: nome });
  }

  return wrapOk(nomeTrim);
}

export function validarLocatarioId(
  locatarioId: string
): Result<string, ErroApp> {
  if (typeof locatarioId !== "string") {
    return locatarioInvalido({ campo: "locatarioId" });
  }

  const idTrim = locatarioId.trim();

  if (idTrim.length === 0) {
    return locatarioInvalido({ campo: "locatarioId", valor: locatarioId });
  }

  return wrapOk(idTrim);
}