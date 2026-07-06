// apps/web/src/shared/pwa/__tests__/syncErrorClassifier.test.ts

import { describe, expect, it } from "vitest";
import { HttpError } from "../../../core/api/httpClient";
import { classifySyncError } from "../syncErrorClassifier";

describe("syncErrorClassifier", () => {
  it("classifica 403 como permission não retryable", () => {
    const error = new HttpError({
      message: "Sem permissão",
      status: 403,
      code: "NAO_AUTORIZADO",
    });

    const classified = classifySyncError(error);

    expect(classified.kind).toBe("permission");
    expect(classified.retryable).toBe(false);
  });

  it("classifica 409 como conflict não retryable", () => {
    const error = new HttpError({
      message: "Duplicado",
      status: 409,
      code: "CONFLITO",
    });

    const classified = classifySyncError(error);

    expect(classified.kind).toBe("conflict");
    expect(classified.retryable).toBe(false);
  });

  it("classifica 422 como validation não retryable", () => {
    const error = new HttpError({
      message: "Inválido",
      status: 422,
      code: "VALIDACAO",
    });

    const classified = classifySyncError(error);

    expect(classified.kind).toBe("validation");
    expect(classified.retryable).toBe(false);
  });

  it("classifica 500 como temporary retryable", () => {
    const error = new HttpError({
      message: "Erro interno",
      status: 500,
    });

    const classified = classifySyncError(error);

    expect(classified.kind).toBe("temporary");
    expect(classified.retryable).toBe(true);
  });

  it("classifica dependência não resolvida", () => {
    const error = new Error("ID obrigatório não resolvido: transacaoId");

    const classified = classifySyncError(error);

    expect(classified.kind).toBe("dependency");
    expect(classified.retryable).toBe(true);
  });
});
