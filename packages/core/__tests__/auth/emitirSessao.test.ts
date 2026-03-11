import { beforeEach, describe, expect, it } from "vitest";
import { criarEmitirSessao } from "../../src/auth/usecases/emitirSessao";

function criarDeps() {
  const eventos: Array<any> = [];
  const ultimoLogin: Array<any> = [];

  return {
    usuariosRepo: {
      async buscarPorEmail(params: { locatarioId: string; email: string }) {
        if (
          params.locatarioId === "tenant-1" &&
          params.email === "admin@teste.com"
        ) {
          return {
            ok: true as const,
            value: {
              usuarioId: "usr-1",
              locatarioId: "tenant-1",
              email: "admin@teste.com",
              senhaHash: "hash-correto",
              status: "ATIVO" as const,
            },
          };
        }

        return { ok: true as const, value: null };
      },

      async atualizarUltimoLogin(params: {
        locatarioId: string;
        usuarioId: string;
        quando: Date;
      }) {
        ultimoLogin.push(params);
        return { ok: true as const, value: undefined };
      },
    },

    locatariosRepo: {
      async buscarPorId(params: { locatarioId: string }) {
        return {
          ok: true as const,
          value:
            params.locatarioId === "tenant-1"
              ? {
                  locatarioId: "tenant-1",
                  status: "ATIVO" as const,
                }
              : null,
        };
      },
    },

    tokens: {
      async criarRefresh(params: {
        locatarioId: string;
        usuarioId: string;
        agora: Date;
        ttlMs: number;
      }) {
        return {
          ok: true as const,
          value: {
            tokenBruto: "refresh-bruto-1",
            tokenId: "token-1",
            expiraEm: new Date(params.agora.getTime() + params.ttlMs),
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

    cripto: {
      async compararSenha(senha: string, senhaHash: string) {
        return {
          ok: true as const,
          value: senha === "123456" && senhaHash === "hash-correto",
        };
      },
    },

    jwt: {
      async emitirAccessToken(params: any) {
        return {
          ok: true as const,
          value: {
            token: `jwt:${params.usuarioId}:${params.locatarioId}:${params.sessionId}`,
            payload: {
              sub: params.usuarioId,
              loc: params.locatarioId,
              session: params.sessionId,
              iat: Math.floor(params.agora.getTime() / 1000),
              exp:
                Math.floor(params.agora.getTime() / 1000) +
                params.ttlSegundos,
              iss: params.issuer,
            },
          },
        };
      },

      validarAccessToken() {
        throw new Error("não usado");
      },
    },

    relogio: {
      agora() {
        return new Date("2026-03-06T12:00:00.000Z");
      },
    },

    ids: {
      gerarId() {
        return "sess-1";
      },
    },

    eventos: {
      async registrarEvento(evt: any) {
        eventos.push(evt);
      },
    },

    _interno: {
      eventos,
      ultimoLogin,
    },
  };
}

describe("auth - emitirSessao", () => {
  let deps: ReturnType<typeof criarDeps>;

  beforeEach(() => {
    deps = criarDeps();
  });

  it("retorna Ok com accessToken e refreshToken quando credenciais são válidas", async () => {
    const emitirSessao = criarEmitirSessao(deps);

    const r = await emitirSessao({
      locatarioId: "tenant-1",
      email: "admin@teste.com",
      senha: "123456",
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.accessToken).toContain("jwt:usr-1:tenant-1:sess-1");
      expect(r.value.refreshToken).toBe("refresh-bruto-1");
      expect(r.value.accessExpiraEm.toISOString()).toBe(
        "2026-03-06T12:10:00.000Z"
      );
    }

    expect(deps._interno.ultimoLogin).toHaveLength(1);
    expect(deps._interno.eventos).toHaveLength(1);
    expect(deps._interno.eventos[0].tipo).toBe("auth.login.sucesso");
  });

  it("retorna Err(INVALIDO) quando email é inválido", async () => {
    const emitirSessao = criarEmitirSessao(deps);

    const r = await emitirSessao({
      locatarioId: "tenant-1",
      email: "",
      senha: "123456",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("INVALIDO");
    }
  });

  it("retorna Err(NAO_AUTENTICADO) quando usuário não existe", async () => {
    const emitirSessao = criarEmitirSessao(deps);

    const r = await emitirSessao({
      locatarioId: "tenant-1",
      email: "nao-existe@teste.com",
      senha: "123456",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTENTICADO");
    }
  });

  it("retorna Err(NAO_AUTENTICADO) quando senha está incorreta", async () => {
    const emitirSessao = criarEmitirSessao(deps);

    const r = await emitirSessao({
      locatarioId: "tenant-1",
      email: "admin@teste.com",
      senha: "senha-errada",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTENTICADO");
    }
  });

  it("retorna Err(CONFLITO) quando locatário não está ativo", async () => {
    const deps2 = criarDeps();
    deps2.locatariosRepo.buscarPorId = async () => ({
      ok: true as const,
      value: {
        locatarioId: "tenant-1",
        status: "SUSPENSO" as const,
      },
    });

    const emitirSessao = criarEmitirSessao(deps2);

    const r = await emitirSessao({
      locatarioId: "tenant-1",
      email: "admin@teste.com",
      senha: "123456",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("CONFLITO");
    }
  });

  it("não bloqueia login se atualizarUltimoLogin falhar", async () => {
    const deps2 = criarDeps();
    deps2.usuariosRepo.atualizarUltimoLogin = async () => ({
      ok: false as const,
      error: {
        codigo: "ERRO_INTERNO",
        mensagem: "Falha ao atualizar último login",
      },
    });

    const emitirSessao = criarEmitirSessao(deps2);

    const r = await emitirSessao({
      locatarioId: "tenant-1",
      email: "admin@teste.com",
      senha: "123456",
    });

    expect(r.ok).toBe(true);
  });
});