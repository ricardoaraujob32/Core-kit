// packages/core/src/tokens/erros.ts

import type { Result } from "../result";
import type { ErroApp } from "../erros";
import { createErroApp } from "../ROPHelpers";
import type { TokenId } from "./tipos";

export function erroTokenNaoEncontrado<T = never>(tokenId?: TokenId): Result<T, ErroApp> {
  return createErroApp({
    codigo: "NAO_ENCONTRADO",
    mensagem: "Token não encontrado.",
    detalhes: tokenId ? { tokenId } : undefined,
  });
}

export function erroTokenRevogado<T = never>(): Result<T, ErroApp> {
  return createErroApp({
    codigo: "INVALIDO",
    mensagem: "Token revogado.",
  });
}

export function erroTokenExpirado<T = never>(): Result<T, ErroApp> {
  return createErroApp({
    codigo: "INVALIDO",
    mensagem: "Token expirado.",
  });
}

export function erroTokenJaRotacionado<T = never>(): Result<T, ErroApp> {
  return createErroApp({
    codigo: "CONFLITO",
    mensagem: "Token já foi rotacionado.",
  });
}

export function erroTokenJaRevogado<T = never>(): Result<T, ErroApp> {
  return createErroApp({
    codigo: "CONFLITO",
    mensagem: "Token já está revogado.",
  });
}

export function erroEntradaInvalida<T = never>(mensagem: string, detalhes?: Record<string, unknown>): Result<T, ErroApp> {
  return createErroApp({
    codigo: "INVALIDO",
    mensagem,
    detalhes,
  });
}