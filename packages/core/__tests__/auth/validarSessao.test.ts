// packages/core/__tests__/auth/validarSessao.test.ts

import { describe, expect, it } from "vitest";
import { createFnValidarSessao } from "../../src/auth";

describe("#1 - createFnValidarSessao", () => {
  it("#1.1 - deve validar access token e retornar sessão", () => {
    const usecase = createFnValidarSessao({
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

    expect(resultado.value.sessao.usuarioId).toBe("user-1");
    expect(resultado.value.sessao.locatarioId).toBe("loc-1");
    expect(resultado.value.sessao.sessionId).toBe("sess-1");
  });

  it("#1.2 - deve falhar com token inválido", () => {
    const usecase = createFnValidarSessao({
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
