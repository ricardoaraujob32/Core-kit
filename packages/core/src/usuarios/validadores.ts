// packages/core/src/usuarios/validadores.ts

import type { ErroApp } from "../erros";
import type { Result } from "../result";
import { usuarioInvalido } from "./erros";
import { UsuarioId } from "./tipos";
import { validarEmail, validarIdGenerico, validarTextoObrigatorio } from "../utils";

function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
  if (resultado.ok) return resultado;
  return usuarioInvalido({ campo, valor });
}

export function validarUsuarioId(usuarioId: UsuarioId): Result<string, ErroApp> {
  return mapearErro(
    validarIdGenerico(usuarioId, "usuarioId"),
    "usuarioId",
    usuarioId,
  );
}

export function validarNomeUsuario(nome: string): Result<string, ErroApp> {
  return mapearErro(
    validarTextoObrigatorio(nome, "nome", 2),
    "nome",
    nome,
  );
}

export function validarEmailUsuario(email: string): Result<string, ErroApp> {
  return mapearErro(
    validarEmail(email, "email"),
    "email",
    email,
  );
}

export function validarSenhaHash(senhaHash: string): Result<string, ErroApp> {
  return mapearErro(
    validarTextoObrigatorio(senhaHash, "senhaHash", 20),
    "senhaHash",
    senhaHash,
  );
}