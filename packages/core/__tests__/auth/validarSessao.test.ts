import { describe, expect, it } from "vitest";
import { criarValidarSessao } from "../usecases/validarSessao";

describe("validarSessao", () => {
  it("valida access token", () => {
    const usecase = criarValidarSessao({
      jwtPorta: {
        async emitirAccessToken() {
          throw new Error("não usado");
        },
        validarAccessToken() {
          return {
            ok: true,
            value: {
              sub: "user-1",
              loc: "loc-1",
              session: "sess-1",
              exp: 1770000000,
            },
          };
        },
      },
    });

    const resultado = usecase({
      accessToken: "jwt-token",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.usuarioId).toBe("user-1");
    expect(resultado.value.locatarioId).toBe("loc-1");
    expect(resultado.value.sessionId).toBe("sess-1");
  });

  it("falha com token inválido", () => {
    const usecase = criarValidarSessao({
      jwtPorta: {
        async emitirAccessToken() {
          throw new Error("não usado");
        },
        validarAccessToken() {
          return {
            ok: false,
            error: {
              codigo: "JWT_INVALIDO",
              mensagem: "jwt inválido",
              detalhes: {},
            },
          };
        },
      },
    });

    const resultado = usecase({
      accessToken: "jwt-invalido",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("AUTH_SESSAO_INVALIDA");
  });
});