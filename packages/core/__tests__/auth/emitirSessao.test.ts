import { describe, expect, it } from "vitest";
import { criarEmitirSessao } from "../usecases/emitirSessao";

describe("emitirSessao", () => {
  it("emite sessão com credenciais válidas", async () => {
    const usecase = criarEmitirSessao({
      usuariosPorta: {
        async buscarPorEmail() {
          return {
            ok: true,
            value: {
              usuarioId: "user-1",
              locatarioId: "loc-1",
              email: "user@example.com",
              senhaHash: "hash",
              status: "ATIVO",
            },
          };
        },
        async atualizarUltimoLogin() {
          return { ok: true, value: undefined };
        },
      },
      locatariosPorta: {
        async buscarPorId() {
          return {
            ok: true,
            value: { locatarioId: "loc-1", status: "ATIVO" },
          };
        },
      },
      tokensPorta: {
        async criarRefresh() {
          return {
            ok: true,
            value: {
              tokenId: "tok-1",
              tokenBruto: "refresh-bruto",
              expiraEm: new Date("2026-03-20T00:00:00.000Z"),
            },
          };
        },
        async validarRefresh() {
          throw new Error("não usado");
        },
        async revogar() {
          throw new Error("não usado");
        },
      },
      hashPorta: {
        async compararSenha() {
          return { ok: true, value: true };
        },
      },
      jwtPorta: {
        async emitirAccessToken() {
          return {
            ok: true,
            value: {
              token: "access-token",
              payload: {
                sub: "user-1",
                loc: "loc-1",
                session: "sess-1",
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
        gerarId: () => "sess-1",
      },
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      email: "user@example.com",
      senha: "123456",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.accessToken).toBe("access-token");
    expect(resultado.value.refreshToken).toBe("refresh-bruto");
  });

  it("falha com senha incorreta", async () => {
    const usecase = criarEmitirSessao({
      usuariosPorta: {
        async buscarPorEmail() {
          return {
            ok: true,
            value: {
              usuarioId: "user-1",
              locatarioId: "loc-1",
              email: "user@example.com",
              senhaHash: "hash",
              status: "ATIVO",
            },
          };
        },
        async atualizarUltimoLogin() {
          return { ok: true, value: undefined };
        },
      },
      tokensPorta: {
        async criarRefresh() {
          throw new Error("não usado");
        },
        async validarRefresh() {
          throw new Error("não usado");
        },
        async revogar() {
          throw new Error("não usado");
        },
      },
      hashPorta: {
        async compararSenha() {
          return { ok: true, value: false };
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
        gerarId: () => "sess-1",
      },
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      email: "user@example.com",
      senha: "errada",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("AUTH_CREDENCIAIS_INVALIDAS");
  });
});