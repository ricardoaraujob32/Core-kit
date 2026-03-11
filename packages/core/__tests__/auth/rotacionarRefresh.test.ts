import { beforeEach, describe, expect, it } from "vitest";
import { criarRotacionarRefresh } from "../../src/auth/usecases/rotacionarRefresh";

function criarDeps() {
  const revogados: Array<any> = [];
  const eventos: Array<any> = [];

  return {
    tokens: {
      async validarRefresh(params: {
        locatarioId: string;
        tokenBruto: string;
        agora: Date;
      }) {
        if (params.tokenBruto === "refresh-valido") {
          return {
            ok: true as const,
            value: {
              tokenId: "token-1",
              usuarioId: "usr-1",
              expiraEm: new Date("2026-03-20T12:00:00.000Z"),
            },
          };
        }

        return {
          ok: false as const,
          error: {
            codigo: "NAO_AUTENTICADO",
            mensagem: "Refresh inválido",
          },
        };
      },

      async criarRefresh(params: {
        locatarioId: string;
        usuarioId: string;
        agora: Date;
        ttlMs: number;
      }) {
        return {
          ok: true as const,
          value: {
            tokenBruto: "refresh-novo",
            tokenId: "token-2",
            expiraEm: new Date(params.agora.getTime() + params.ttlMs),
          },
        };
      },

      async revogar(params: any) {
        revogados.push(params);
        return { ok: true as const, value: undefined };
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
        return "sess-2";
      },
    },

    eventos: {
      async registrarEvento(evt: any) {
        eventos.push(evt);
      },
    },

    _interno: {
      revogados,
      eventos,
    },
  };
}

describe("auth - rotacionarRefresh", () => {
  let deps: ReturnType<typeof criarDeps>;

  beforeEach(() => {
    deps = criarDeps();
  });

  it("revoga refresh antigo e retorna nova sessão", async () => {
    const rotacionarRefresh = criarRotacionarRefresh(deps);

    const r = await rotacionarRefresh({
      locatarioId: "tenant-1",
      refreshToken: "refresh-valido",
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.accessToken).toContain("jwt:usr-1:tenant-1:sess-2");
      expect(r.value.refreshToken).toBe("refresh-novo");
    }

    expect(deps._interno.revogados).toHaveLength(1);
    expect(deps._interno.eventos).toHaveLength(1);
    expect(deps._interno.eventos[0].tipo).toBe("auth.refresh");
  });

  it("propaga erro quando refresh token é inválido", async () => {
    const rotacionarRefresh = criarRotacionarRefresh(deps);

    const r = await rotacionarRefresh({
      locatarioId: "tenant-1",
      refreshToken: "refresh-invalido",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTENTICADO");
    }
  });

  it("retorna Err(INVALIDO) quando refreshToken é vazio", async () => {
    const rotacionarRefresh = criarRotacionarRefresh(deps);

    const r = await rotacionarRefresh({
      locatarioId: "tenant-1",
      refreshToken: "",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("INVALIDO");
    }
  });
});