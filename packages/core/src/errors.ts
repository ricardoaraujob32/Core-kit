/**
 * AppError padroniza erros da aplicação (API, serviços, etc.)
 * para log, retorno HTTP, auditoria e suporte.
 */

export type AppErrorCode =
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL";

export type AppError = {
  code: AppErrorCode;
  message: string;
  details?: Record<string, unknown>;
  cause?: unknown;
};

/**
 * Constrói um AppError padronizado.
 */
export function appError(
  code: AppErrorCode,
  message: string,
  details?: Record<string, unknown>,
  cause?: unknown,
): AppError {
  return { code, message, details, cause };
}
