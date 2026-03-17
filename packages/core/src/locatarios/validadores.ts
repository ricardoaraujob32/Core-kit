// packages/core/src/locatarios/validadores.ts

import type { Result } from "../result";
import type { ErroApp } from "../erros";
import { locatarioInvalido } from "./erros";
import { LocatarioId } from "./tipos";
import { validarIdGenerico, validarTextoObrigatorio } from "../utils";

function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
  if (resultado.ok) return resultado;
  return locatarioInvalido({ campo, valor });
}

export function validarNomeLocatario(nome: string): Result<string, ErroApp> {
  return mapearErro(
    validarTextoObrigatorio(nome, "nome", 2),
    "nome",
    nome,
  );
}

export function validarLocatarioId(locatarioId: LocatarioId): Result<string, ErroApp> {
  return mapearErro(
    validarIdGenerico(locatarioId, "locatarioId"),
    "locatarioId",
    locatarioId,
  );
}