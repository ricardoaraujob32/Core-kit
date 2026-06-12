// packages/core/__tests__/auth/logout.test.ts

import { describe, expect, it } from "vitest";
import { createFnLogout } from "../../src/auth";

describe("#1 - createFnLogout", () => {
  it("#1.1 - deve validar e revogar refresh token", async () => {
    let revogou = false;

    const usecase = createFnLogout({
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
          revogou = true;
          return { ok: true, value: undefined };
        },
      },
      relogio: {
        agora: () => new Date("2026-03-12T10:00:00.000Z"),
      },
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      refreshToken: "refresh-token",
    });

    expect(resultado.ok).toBe(true);
    expect(revogou).toBe(true);
  });

  it("#1.2 - deve propagar falha de refresh inválido", async () => {
    const usecase = createFnLogout({
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
      relogio: {
        agora: () => new Date("2026-03-12T10:00:00.000Z"),
      },
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      refreshToken: "refresh-token",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("TOKEN_INVALIDO");
  });
});