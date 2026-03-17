// packages/core/src/tokens/erros.ts

import { createErroApp } from "../ROPHelpers";
import { TokenId } from "./tipos";

export function entradaInvalida(detalhes?: Record<string, unknown>) {
  return createErroApp({
    codigo: "INVALIDO",
    mensagem: "Entrada inválida.",
    detalhes,
  });
}

export function tokenNaoAutenticado() {
  return createErroApp({
    codigo: "NAO_AUTENTICADO",
    mensagem: "Token inválido, expirado ou revogado.",
  });
}

export function conflitoRotacao(detalhes?: Record<string, unknown>) {
  return createErroApp({
    codigo: "CONFLITO",
    mensagem: "Conflito na rotação do token.",
    detalhes,
  });
}

export function tokenInvalido(detalhes?: Record<string, unknown>) {
  return createErroApp({
    codigo: "TOKEN_INVALIDO",
    mensagem: "Dados do token inválidos.",
    detalhes,
  });
}

export function tokenNaoEncontrado(tokenIdOuHash: TokenId | string) {
  return createErroApp({
    codigo: "TOKEN_NAO_ENCONTRADO",
    mensagem: "Token não encontrado.",
    detalhes: { tokenIdOuHash },
  });
}

export function tokenRevogado(tokenId: TokenId) {
  return createErroApp({
    codigo: "TOKEN_REVOGADO",
    mensagem: "Token revogado.",
    detalhes: { tokenId },
  });
}

export function tokenExpirado(tokenId: TokenId) {
  return createErroApp({
    codigo: "TOKEN_EXPIRADO",
    mensagem: "Token expirado.",
    detalhes: { tokenId },
  });
}

export function hashTokenJaExiste(hashToken: string) {
  return createErroApp({
    codigo: "TOKEN_HASH_JA_EXISTE",
    mensagem: "Já existe token com este hash.",
    detalhes: { hashToken },
  });
}