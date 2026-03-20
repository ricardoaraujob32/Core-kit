// packages/core/src/usuarios/erros.ts

import { LocatarioId } from "../locatarios";
import { createErroApp } from "../kernel";
import { UsuarioId } from "./tipos";

/**
 * 
 * @param detalhes 
 * @returns 
 */
export function usuarioInvalido(detalhes?: Record<string, unknown>) {
  return createErroApp({codigo: "USUARIO_INVALIDO", detalhes});
}

/**
 * 
 * @param usuarioId 
 * @returns 
 */
export function usuarioNaoEncontrado(usuarioId: UsuarioId) {
  return createErroApp({codigo: "USUARIO_NAO_ENCONTRADO", detalhes: { usuarioId } });
}

/**
 * 
 * @param usuarioId 
 * @returns 
 */
export function usuarioInativo(usuarioId: UsuarioId) {
  return createErroApp({codigo: "USUARIO_INATIVO", detalhes: { usuarioId } });
}

/**
 * 
 * @param usuarioId 
 * @returns 
 */
export function usuarioSuspenso(usuarioId: UsuarioId) {
  return createErroApp({codigo: "USUARIO_SUSPENSO", detalhes: { usuarioId } });
}

/**
 * 
 * @param usuarioId 
 * @returns 
 */
export function usuarioEncerrado(usuarioId: UsuarioId) {
  return createErroApp({codigo: "USUARIO_ENCERRADO", detalhes: { usuarioId } });
}

/**
 * 
 * @param email 
 * @param locatarioId 
 * @returns 
 */
export function emailUsuarioJaExiste(email: string, locatarioId: LocatarioId | null) {
  return createErroApp({codigo: "USUARIO_EMAIL_JA_EXISTE", detalhes: { email, locatarioId } });
}
