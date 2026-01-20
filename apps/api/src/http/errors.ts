import type { AppError } from "@core-kit/core";

export type HttpErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

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

export function toHttpErrorBody(err: AppError): HttpErrorResponse {
  return {
    error: {
      code: err.code,
      message: err.message,
      details: err.details,
    },
  };
}
