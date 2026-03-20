// packages/core/src/auth/erros.ts

import { createErroApp } from "../kernel";

/**
 * 
 * @returns 
 */
export function credenciaisInvalidas() {
  return createErroApp({
    codigo: "AUTH_CREDENCIAIS_INVALIDAS",
    mensagem: "Credenciais inválidas.",
    detalhes: {},
  });
}

/**
 * 
 * @returns 
 */
export function tokenInvalidoOuExpirado() {
  return createErroApp({
    codigo: "AUTH_TOKEN_INVALIDO_OU_EXPIRADO",
    mensagem: "Token inválido ou expirado.",
    detalhes: {},
  });
}

/**
 * 
 * @param status 
 * @returns 
 */
export function usuarioNaoPodeAutenticar(status: string) {
  return createErroApp({
    codigo: "AUTH_USUARIO_NAO_PODE_AUTENTICAR",
    mensagem: "Usuário não pode autenticar.",
    detalhes: { status },
  });
}

/**
 * 
 * @param status 
 * @returns 
 */
export function locatarioNaoPodeAutenticar(status: string) {
  return createErroApp({
    codigo: "AUTH_LOCATARIO_NAO_PODE_AUTENTICAR",
    mensagem: "Locatário não pode autenticar.",
    detalhes: { status },
  });
}

/**
 * 
 * @param detalhes 
 * @returns 
 */
export function authEntradaInvalida(detalhes?: Record<string, unknown>) {
  return createErroApp({
    codigo: "AUTH_ENTRADA_INVALIDA",
    mensagem: "Entrada inválida para autenticação.",
    detalhes,
  });
}

/**
 * 
 * @returns 
 */
export function sessaoInvalida() {
  return createErroApp({
    codigo: "AUTH_SESSAO_INVALIDA",
    mensagem: "Sessão inválida.",
    detalhes: {},
  });
}
