import { describe, it, expect } from "vitest";
import { appError } from "../src/errors";

describe("errors", () => {
  it("appError() cria um erro padronizado sem details", () => {
    const e = appError("UNAUTHORIZED", "Usuário não autenticado.");

    expect(e).toEqual({
      code: "UNAUTHORIZED",
      message: "Usuário não autenticado.",
      details: undefined,
      cause: undefined,
    });

    // garante serialização previsível
    expect(JSON.parse(JSON.stringify(e))).toEqual({
      code: "UNAUTHORIZED",
      message: "Usuário não autenticado.",
    });
  });

  it("appError() inclui details quando fornecido", () => {
    const e = appError("FORBIDDEN", "Permissões insuficientes.", {
      permissaoExigida: "ADMIN",
    });

    expect(e).toEqual({
      code: "FORBIDDEN",
      message: "Permissões insuficientes.",
      details: { permissaoExigida: "ADMIN" },
      cause: undefined,
    });

    // serializável com details
    expect(JSON.parse(JSON.stringify(e))).toEqual({
      code: "FORBIDDEN",
      message: "Permissões insuficientes.",
      details: { permissaoExigida: "ADMIN" },
    });
  });
});
