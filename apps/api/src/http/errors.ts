import type { AppError } from "@core-kit/core";

export type HttpErrorResponse = {
  error: {
    code: AppError["code"];
    message: string;
    details?: Record<string, unknown>;
  };
};

/**
 * @param err Erro do Core Kit
 * @returns Status HTTP correspondente
 */
export function mapAppErrorToHttpStatus(err: AppError): number {
  switch (err.code) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "CONFLICT":
      return 409;
    case "VALIDATION":
      return 400;
    default:
      return 500;
  }
}

/**
 * @param err Erro do Core Kit
 * @returns Payload HTTP padronizado
 */
export function toHttpErrorBody(err: AppError): HttpErrorResponse {
  const body: HttpErrorResponse = {
    error: {
      code: err.code,
      message: err.message,
    },
  };

  // Só inclui `details` se for útil (evita `details: undefined`)
  if (err.details && typeof err.details === "object") {
    body.error.details = err.details as Record<string, unknown>;
  }

  return body;
}
