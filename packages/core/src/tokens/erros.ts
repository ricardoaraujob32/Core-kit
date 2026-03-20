// packages/core/src/tokens/erros.ts

import { createErroApp } from "../kernel";
import { TokenId } from "./tipos";

/**
 * 
 * @param detalhes 
 * @returns 
 */
export function entradaInvalida(detalhes?: Record<string, unknown>) {
  return createErroApp({
    codigo: "INVALIDO",
    mensagem: "Entrada inválida.",
    detalhes,
  });
}

/**
 * 
 * @returns 
 */
export function tokenNaoAutenticado() {
  return createErroApp({
    codigo: "NAO_AUTENTICADO",
    mensagem: "Token inválido, expirado ou revogado.",
  });
}

/**
 * 
 * @param detalhes 
 * @returns 
 */
export function conflitoRotacao(detalhes?: Record<string, unknown>) {
  return createErroApp({
    codigo: "CONFLITO",
    mensagem: "Conflito na rotação do token.",
    detalhes,
  });
}

/**
 * 
 * @param detalhes 
 * @returns 
 */
export function tokenInvalido(detalhes?: Record<string, unknown>) {
  return createErroApp({codigo: "TOKEN_INVALIDO", detalhes});
}

/**
 * 
 * @param tokenIdOuHash 
 * @returns 
 */
export function tokenNaoEncontrado(tokenIdOuHash: TokenId | string) {
  return createErroApp({codigo: "TOKEN_NAO_ENCONTRADO", detalhes: { tokenIdOuHash } });
}

/**
 * 
 * @param tokenId 
 * @returns 
 */
export function tokenRevogado(tokenId: TokenId) {
  return createErroApp({codigo: "TOKEN_REVOGADO", detalhes: { tokenId } });
}

/**
 * 
 * @param tokenId 
 * @returns 
 */
export function tokenExpirado(tokenId: TokenId) {
  return createErroApp({codigo: "TOKEN_EXPIRADO", detalhes: { tokenId } });
}

/**
 * 
 * @param hashToken 
 * @returns 
 */
export function hashTokenJaExiste(hashToken: string) {
  return createErroApp({codigo: "TOKEN_HASH_JA_EXISTE", detalhes: { hashToken } });
}
