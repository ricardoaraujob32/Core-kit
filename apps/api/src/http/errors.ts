// apps/api/src/http/errors.ts
import type { AppError, AppErrorCode } from "@core-kit/core";

/**
 *
 */
const FORBIDDEN_DEFAULT_MESSAGE = "Permissões insuficientes";

/**
 * Mapeia AppErrorCode (core) → HTTP Status
 * NÃO inventa códigos novos.
 */
export function mapAppErrorToHttpStatus(code: AppErrorCode): number {
  switch (code) {
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
      // fallback defensivo (nunca deveria acontecer)
      return 500;
  }
}

/**
 * Remove undefined recursivamente
 * Mantém JSON estável (cache, logs, testes).
 */
export function stripUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * Normaliza mensagem de FORBIDDEN
 * sem alterar código nem estrutura.
 */
export function normalizeForbiddenMessage(err: AppError): AppError {
  if (err.code !== "FORBIDDEN") return err;

  if (err.message === FORBIDDEN_DEFAULT_MESSAGE) return err;

  return {
    ...err,
    message: FORBIDDEN_DEFAULT_MESSAGE,
  };
}

/**
 * Converte AppError → payload HTTP
 * (contrato explícito de saída)
 */
export function toHttpErrorBody(err: AppError) {
  return stripUndefined({
    code: err.code,
    message: err.message,
    details: err.details,
  });
}
