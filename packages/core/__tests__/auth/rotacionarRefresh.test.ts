// packages/core/__tests__/auth/rotacionarRefresh.test.ts

import { describe, expect, it } from "vitest";
import { createFnRotacionarRefresh } from "../../src/auth";

describe("#1 - createFnRotacionarRefresh", () => {
  it("#1.1 - deve rotacionar refresh com sucesso", async () => {
    const usecase = createFnRotacionarRefresh({
      tokensPorta: {
        async validarRefresh() {
          return {
            ok: true,
            value: {
              chave: {
                tokenId: "tok-1",
                usuarioId: "user-1",
                locatarioId: "loc-1",
              },
            },
          };
        },
        async criarRefresh() {
          return {
            ok: true,
            value: {
              chave: {
                tokenId: "tok-2",
                usuarioId: "user-1",
                locatarioId: "loc-1",
              },
              tokenBruto: "refresh-novo",
              expiraEm: new Date("2026-03-20T00:00:00.000Z"),
            },
          };
        },
        async revogar() {
          return { ok: true, value: undefined };
        },
      },
      jwtPorta: {
        async emitirAccessToken() {
          return {
            ok: true,
            value: {
              token: "access-novo",
              payload: {
                sub: "user-1",
                loc: "loc-1",
                session: "sess-2",
                exp: 1770000000,
              },
            },
          };
        },
        validarAccessToken() {
          throw new Error("não usado");
        },
      },
      relogio: {
        agora: () => new Date("2026-03-12T10:00:00.000Z"),
      },
      idPorta: {
        gerarId: () => "sess-2",
      },
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      refreshToken: "refresh-antigo",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.sessao.accessToken).toBe("access-novo");
    expect(resultado.value.sessao.refreshToken).toBe("refresh-novo");
  });

  it("#1.2 - deve falhar quando refresh é inválido", async () => {
    const usecase = createFnRotacionarRefresh({
      tokensPorta: {
        async validarRefresh() {
          return {
            ok: false,
            error: {
              codigo: "TOKEN_INVALIDO",
              mensagem: "Refresh inválido.",
              detalhes: { simulada: true },
            },
          };
        },
        async criarRefresh() {
          throw new Error("não usado");
        },
        async revogar() {
          throw new Error("não usado");
        },
      },
      jwtPorta: {
        async emitirAccessToken() {
          throw new Error("não usado");
        },
        validarAccessToken() {
          throw new Error("não usado");
        },
      },
      relogio: {
        agora: () => new Date("2026-03-12T10:00:00.000Z"),
      },
      idPorta: {
        gerarId: () => "sess-2",
      },
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      refreshToken: "refresh-antigo",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("TOKEN_INVALIDO");
  });

  it("#1.3 - deve falhar quando emissão de access token falha", async () => {
    const usecase = createFnRotacionarRefresh({
      tokensPorta: {
        async validarRefresh() {
          return {
            ok: true,
            value: {
              chave: {
                tokenId: "tok-1",
                usuarioId: "user-1",
                locatarioId: "loc-1",
              },
            },
          };
        },
        async criarRefresh() {
          throw new Error("não usado");
        },
        async revogar() {
          throw new Error("não usado");
        },
      },
      jwtPorta: {
        async emitirAccessToken() {
          return {
            ok: false,
            error: {
              codigo: "JWT_ERRO",
              mensagem: "Falha ao emitir JWT.",
              detalhes: { simulada: true },
            },
          };
        },
        validarAccessToken() {
          throw new Error("não usado");
        },
      },
      relogio: {
        agora: () => new Date("2026-03-12T10:00:00.000Z"),
      },
      idPorta: {
        gerarId: () => "sess-2",
      },
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      refreshToken: "refresh-antigo",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("JWT_ERRO");
  });
});
