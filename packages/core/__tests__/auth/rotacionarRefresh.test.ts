import { describe, expect, it } from "vitest";
import { criarRotacionarRefresh } from "../usecases/rotacionarRefresh";

describe("rotacionarRefresh", () => {
  it("rotaciona refresh com sucesso", async () => {
    const usecase = criarRotacionarRefresh({
      tokensPorta: {
        async validarRefresh() {
          return {
            ok: true,
            value: {
              tokenId: "tok-1",
              usuarioId: "user-1",
              locatarioId: "loc-1",
            },
          };
        },
        async criarRefresh() {
          return {
            ok: true,
            value: {
              tokenId: "tok-2",
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

    expect(resultado.value.accessToken).toBe("access-novo");
    expect(resultado.value.refreshToken).toBe("refresh-novo");
  });
});