// packages/core/__tests__/auth/emitirSessao.test.ts

import { describe, expect, it } from "vitest";
import { createFnEmitirSessao } from "../../src/auth";
import { wrapOk } from "../../src/kernel";

function criarDepsBase(overrides: Partial<Parameters<typeof createFnEmitirSessao>[0]> = {}) {
  return {
    usuariosRepositorio: {
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
    locatariosRepositorio: {
      async buscarPorSlug() {
        return {
          ok: true,
          value: {
            locatarioId: "loc-1",
            slug: "empresa",
            status: "ATIVO",
          },
        };
      },
    },
    tokensPorta: {
      async criarRefresh() {
        return {
          ok: true,
          value: {
            chave: {
              tokenId: "tok-1",
              usuarioId: "user-1",
              locatarioId: "loc-1",
            },
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
      async gerarHashSenha() {
        return { ok: true, value: "hash" };
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
    ...overrides,
  } as Parameters<typeof createFnEmitirSessao>[0];
}

describe("#1 - createFnEmitirSessao", () => {
  it("#1.1 - deve emitir sessão com credenciais válidas", async () => {
    const usecase = createFnEmitirSessao(criarDepsBase());

    const resultado = await usecase({
      locatarioSlug: "empresa",
      email: "user@example.com",
      senha: "12345678",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.sessao.accessToken).toBe("access-token");
    expect(resultado.value.sessao.refreshToken).toBe("refresh-bruto");
  });

  it("#1.2 - deve falhar com senha incorreta", async () => {
    const usecase = createFnEmitirSessao(
      criarDepsBase({
        hashPorta: {
          async compararSenha() {
            return { ok: true, value: false };
          },
          async gerarHashSenha() {
            return { ok: true, value: "hash" };
          },
        },
      }),
    );

    const resultado = await usecase({
      locatarioSlug: "empresa",
      email: "user@example.com",
      senha: "senha-incorreta-123",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("AUTH_CREDENCIAIS_INVALIDAS");
  });

  it("#1.3 - deve falhar quando locatário não existe", async () => {
    const usecase = createFnEmitirSessao(
      criarDepsBase({
        locatariosRepositorio: {
          async buscarPorSlug() {
            return { ok: true, value: null };
          },
        },
      }),
    );

    const resultado = await usecase({
      locatarioSlug: "empresa",
      email: "user@example.com",
      senha: "12345678",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("AUTH_CREDENCIAIS_INVALIDAS");
  });

  it("#1.4 - deve falhar quando locatário está suspenso", async () => {
    const usecase = createFnEmitirSessao(
      criarDepsBase({
        locatariosRepositorio: {
          async buscarPorSlug() {
            return {
              ok: true,
              value: {
                locatarioId: "loc-1",
                status: "SUSPENSO",
              },
            };
          },
        },
      }),
    );

    const resultado = await usecase({
      locatarioSlug: "empresa",
      email: "user@example.com",
      senha: "12345678",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("AUTH_LOCATARIO_NAO_PODE_AUTENTICAR");
  });

  it("#1.5 - deve falhar quando usuário não existe", async () => {
    const usecase = createFnEmitirSessao(
      criarDepsBase({
        usuariosRepositorio: {
          async buscarPorEmail() {
            return { ok: true, value: null };
          },
          async atualizarUltimoLogin() {
            return { ok: true, value: undefined };
          },
          buscarUsuarioPlataformaPorEmail: async () => wrapOk(null),
        },
      }),
    );

    const resultado = await usecase({
      locatarioSlug: "empresa",
      email: "user@example.com",
      senha: "12345678",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("AUTH_CREDENCIAIS_INVALIDAS");
  });

  it("#1.6 - deve falhar quando usuário não está ativo", async () => {
    const usecase = createFnEmitirSessao(
      criarDepsBase({
        usuariosRepositorio: {
          async buscarPorEmail() {
            return {
              ok: true,
              value: {
                usuarioId: "user-1",
                locatarioId: "loc-1",
                email: "user@example.com",
                senhaHash: "hash",
                status: "INATIVO",
              },
            };
          },
          async atualizarUltimoLogin() {
            return { ok: true, value: undefined };
          },
          buscarUsuarioPlataformaPorEmail: async () => wrapOk(null),
        },
      }),
    );

    const resultado = await usecase({
      locatarioSlug: "empresa",
      email: "user@example.com",
      senha: "12345678",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("AUTH_USUARIO_NAO_PODE_AUTENTICAR");
  });
});
