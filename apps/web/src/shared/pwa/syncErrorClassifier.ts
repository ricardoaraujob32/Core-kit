// apps/web/src/shared/pwa/syncErrorClassifier.ts

import { mapError } from "../../core/errors/mapError";
import type { PwaSyncError } from "./pwaSyncTypes";

function extractStatus(error: unknown): number | null {
  const candidate = error as {
    status?: number;
    response?: { status?: number };
    cause?: { status?: number };
  };

  return (
    candidate?.status ??
    candidate?.response?.status ??
    candidate?.cause?.status ??
    null
  );
}

function extractCode(error: unknown): string | null {
  const candidate = error as {
    codigo?: string;
    code?: string;
    error?: { codigo?: string; code?: string };
    response?: { data?: { codigo?: string; code?: string } };
  };

  return (
    candidate?.codigo ??
    candidate?.code ??
    candidate?.error?.codigo ??
    candidate?.error?.code ??
    candidate?.response?.data?.codigo ??
    candidate?.response?.data?.code ??
    null
  );
}

export function classifySyncError(error: unknown): PwaSyncError {
  const mapped = mapError(error);
  const status = extractStatus(error);
  const code = extractCode(error);
  const message = mapped.message || "Falha ao sincronizar pendência offline.";

  if (code === "PWA_PAYLOAD_INVALIDO") {
    return {
      kind: "validation",
      message,
      retryable: false,
      details: { status, code, error },
    };
  }

  if (status === 401 || status === 403) {
    return {
      kind: "permission",
      message,
      retryable: false,
      details: { status, code, error },
    };
  }

  if (status === 409 || code === "CONFLITO" || code === "DUPLICADO") {
    return {
      kind: "conflict",
      message,
      retryable: false,
      details: { status, code, error },
    };
  }

  if (
    status === 400 ||
    status === 422 ||
    code === "VALIDACAO" ||
    code === "INVALIDO"
  ) {
    return {
      kind: "validation",
      message,
      retryable: false,
      details: { status, code, error },
    };
  }

  if (
    code === "DEPENDENCIA_OFFLINE_NAO_RESOLVIDA" ||
    message.toLowerCase().includes("não resolvido") ||
    message.toLowerCase().includes("nao resolvido")
  ) {
    return {
      kind: "dependency",
      message,
      retryable: true,
      details: { status, code, error },
    };
  }

  if (status === 408 || status === 429 || (status && status >= 500)) {
    return {
      kind: "temporary",
      message,
      retryable: true,
      details: { status, code, error },
    };
  }

  return {
    kind: "unknown",
    message,
    retryable: true,
    details: { status, code, error },
  };
}
