/**
 * AppError padroniza erros da aplicação (API, serviços, etc.)
 * para log, retorno HTTP, auditoria e suporte.
 */

// packages/core/src/errors.ts
export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INVALID"
  | "NOT_FOUND"
  | "INTERNAL_ERROR"
  | "CONFLICT"
  | "VALIDATION";

// export type AppError<T extends object = {}> = {
//   code: AppErrorCode;
//   message: string;
//   details?: T;
// };

// export function appError<T extends object = {}>(
//   code: AppErrorCode,
//   message: string,
//   details?: T,
// ): AppError<T> {
//   return { code, message, details };
// }

/**
 * Erro de domínio da aplicação.
 *
 * - NÃO depende de HTTP
 * - NÃO lança exceção
 * - É dado puro (serializável)
 */
export interface AppError {
  code: AppErrorCode;
  message: string;

  /**
   * Detalhes estruturados para cliente / logs.
   * Deve ser JSON-safe.
   */
  details?: Record<string, unknown>;

  /**
   * Causa original do erro (ex: exceção capturada).
   * Nunca deve ser enviada diretamente ao cliente.
   */
  cause?: unknown;
}

/**
 * Factory padrão de AppError.
 *
 * Centraliza criação para manter consistência
 * e facilitar observabilidade.
 */
export function appError(
  code: AppErrorCode,
  message: string,
  details?: Record<string, unknown>,
  cause?: unknown,
): AppError {
  return {
    code,
    message,
    details,
    cause,
  };
}

/**
 * Type guard utilitário.
 */
export function isAppError(value: unknown): value is AppError {
  if (!value || typeof value !== "object") return false;

  const v = value as Partial<AppError>;

  return typeof v.code === "string" && typeof v.message === "string";
}
