/**
 * AppError padroniza erros da aplicação (API, serviços, etc.)
 * para log, retorno HTTP, auditoria e suporte.
 */

// errors.ts
export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INVALID"
  | "NOT_FOUND"
  | "INTERNAL_ERROR"
  | "CONFLICT"
  | "VALIDATION";

export type AppError<T extends object = {}> = {
  code: AppErrorCode;
  message: string;
  details?: T;
};

export function appError<T extends object = {}>(
  code: AppErrorCode,
  message: string,
  details?: T,
): AppError<T> {
  return { code, message, details };
}
