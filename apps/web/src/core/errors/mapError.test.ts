// frontend/src/core/errors/__tests__/mapError.test.ts

import { describe, it, expect } from "vitest";
import { mapError } from "../mapError";
import { HttpError } from "../../api/httpClient";

describe("mapError", () => {
  it("deve mapear NAO_AUTENTICADO", () => {
    const error = new HttpError({
      message: "Sessão expirada",
      status: 401,
      code: "NAO_AUTENTICADO",
    });

    const result = mapError(error);

    expect(result.code).toBe("NAO_AUTENTICADO");
    expect(result.message).toBe("Sessão expirada");
  });

  it("deve mapear 403 sem código explícito", () => {
    const error = new HttpError({
      message: "Forbidden",
      status: 403,
    });

    const result = mapError(error);

    expect(result.code).toBe("NAO_AUTORIZADO");
  });

  it("deve mapear erro comum para UNKNOWN", () => {
    const result = mapError(new Error("Falha inesperada"));

    expect(result.code).toBe("UNKNOWN");
    expect(result.message).toBe("Falha inesperada");
  });
});