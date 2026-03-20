// packages/core/src/usuarios/validadores.ts

import { validarEmail, validarIdGenerico, validarTextoObrigatorio, type ErroApp, type Result } from "../kernel";
import { usuarioInvalido } from "./erros";
import { UsuarioId } from "./tipos";

/**
 * 
 * @param resultado 
 * @param campo 
 * @param valor 
 * @returns 
 */
function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
  if (resultado.ok) return resultado;
  return usuarioInvalido({ campo, valor });
}

/**
 * 
 * @param usuarioId 
 * @returns 
 */
export function validarUsuarioId(usuarioId: UsuarioId): Result<string, ErroApp> {
  return mapearErro(
    validarIdGenerico(usuarioId, "usuarioId"),
    "usuarioId",
    usuarioId,
  );
}

/**
 * 
 * @param nome 
 * @returns 
 */
export function validarNomeUsuario(nome: string): Result<string, ErroApp> {
  return mapearErro(
    validarTextoObrigatorio(nome, "nome", 2),
    "nome",
    nome,
  );
}

/**
 * 
 * @param email 
 * @returns 
 */
export function validarEmailUsuario(email: string): Result<string, ErroApp> {
  return mapearErro(
    validarEmail(email, "email"),
    "email",
    email,
  );
}

/**
 * 
 * @param senhaHash 
 * @returns 
 */
export function validarSenhaHash(senhaHash: string): Result<string, ErroApp> {
  return mapearErro(
    validarTextoObrigatorio(senhaHash, "senhaHash", 20),
    "senhaHash",
    senhaHash,
  );
}