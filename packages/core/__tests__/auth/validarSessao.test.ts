import { describe, expect, it } from "vitest";
import { criarValidarSessao } from "../../src/auth/usecases/validarSessao";

describe("auth - validarSessao", () => {
  it("retorna Ok quando token é válido", () => {
    const validarSessao = criarValidarSessao({
      jwt: {
        async emitirAccessToken() {
          throw new Error("não usado");
        },
        validarAccessToken() {
          return {
            ok: true as const,
            value: {
              sub: "usr-1",
              loc: "tenant-1",
              session: "sess-1",
              iat: 1700000000,
              exp: 1700000600,
              iss: "mini-saas-auth",
            },
          };
        },
      },
    });

    const r = validarSessao({
      token: "jwt-token-valido",
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.usuarioId).toBe("usr-1");
      expect(r.value.locatarioId).toBe("tenant-1");
      expect(r.value.sessionId).toBe("sess-1");
    }
  });

  it("retorna Err(NAO_AUTENTICADO) quando token é inválido", () => {
    const validarSessao = criarValidarSessao({
      jwt: {
        async emitirAccessToken() {
          throw new Error("não usado");
        },
        validarAccessToken() {
          return {
            ok: false as const,
            error: {
              codigo: "NAO_AUTENTICADO",
              mensagem: "Token inválido",
            },
          };
        },
      },
    });

    const r = validarSessao({
      token: "jwt-token-invalido",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTENTICADO");
    }
  });
});