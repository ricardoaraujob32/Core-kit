// apps/api/src/http/errors.ts
//
// Finalidade:
// - Centralizar utilitários de HTTP relacionados a erros do Core Kit.
// - Mapear códigos de erro do domínio (AppErrorCode) para status HTTP.
// - Normalizar mensagens (ex.: FORBIDDEN) e padronizar payload de erro.
//
// Observações:
// - Este arquivo NÃO deve conhecer Fastify/Express/etc.
// - Não vaze detalhes sensíveis de erros inesperados para o cliente.

import type { AppError, AppErrorCode } from "@core-kit/core";

const MENSAGEM_PADRAO_FORBIDDEN = "Permissões insuficientes";

/**
 * Mapeia AppErrorCode (Core Kit) → HTTP status.
 * Mantém um fallback defensivo (500) para códigos desconhecidos.
 */
export function mapAppErrorToHttpStatus(codigo: AppErrorCode): number {
  switch (codigo) {
    case "VALIDATION":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "CONFLICT":
      return 409;
    default:
      return 500;
  }
}

/**
 * Remove `undefined` recursivamente.
 * Mantém JSON estável (cache, logs, testes).
 */
export function stripUndefined<T>(objeto: T): T {
  return JSON.parse(JSON.stringify(objeto)) as T;
}

/**
 * Normaliza mensagem de FORBIDDEN sem alterar código nem estrutura.
 */
export function normalizeForbiddenMessage(erro: AppError): AppError {
  if (erro.code !== "FORBIDDEN") return erro;

  if (erro.message === MENSAGEM_PADRAO_FORBIDDEN) return erro;

  return {
    ...erro,
    message: MENSAGEM_PADRAO_FORBIDDEN,
  };
}

/**
 * Converte AppError → payload HTTP (contrato explícito e estável).
 */
export function toHttpErrorBody(erro: AppError) {
  return stripUndefined({
    code: erro.code,
    message: erro.message,
    details: erro.details,
  });
}
