import { describe, it, expect } from "vitest";
import { criarCriarRefreshToken } from "../../src/tokens/usecases/criarRefreshToken";
import { criarTokensRepositorioMemoria } from "../../src/tokens/repositorioMemoria";

describe("tokens - criarRefreshToken", () => {
  it("cria refresh token, persiste apenas hash e retorna token bruto", async () => {
    const repo = criarTokensRepositorioMemoria();

    const criarRefreshToken = criarCriarRefreshToken({
      tokensRepo: repo,
      cripto: {
        async gerarTokenSeguro() {
          return { ok: true as const, value: "refresh-bruto-1" };
        },
        async hashToken(tokenBruto: string) {
          return { ok: true as const, value: `hash:${tokenBruto}` };
        },
      },
      ids: {
        gerarId() {
          return "token-1";
        },
      },
    });

    const agora = new Date("2026-03-06T12:00:00.000Z");

    const r = await criarRefreshToken({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
      agora,
      ttlMs: 1000 * 60 * 60,
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.tokenBruto).toBe("refresh-bruto-1");
      expect(r.value.tokenId).toBe("token-1");
      expect(r.value.expiraEm.toISOString()).toBe(
        new Date(agora.getTime() + 1000 * 60 * 60).toISOString()
      );
    }

    const dump = repo.dump();
    expect(dump).toHaveLength(1);
    expect(dump[0].hashToken).toBe("hash:refresh-bruto-1");
    expect(dump[0].tipo).toBe("REFRESH");
  });

  it("retorna Err(INVALIDO) quando ttl é inválido", async () => {
    const repo = criarTokensRepositorioMemoria();

    const criarRefreshToken = criarCriarRefreshToken({
      tokensRepo: repo,
      cripto: {
        async gerarTokenSeguro() {
          return { ok: true as const, value: "refresh-bruto-1" };
        },
        async hashToken(tokenBruto: string) {
          return { ok: true as const, value: `hash:${tokenBruto}` };
        },
      },
      ids: {
        gerarId() {
          return "token-1";
        },
      },
    });

    const r = await criarRefreshToken({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
      agora: new Date(),
      ttlMs: 0,
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("INVALIDO");
    }
  });

  it("propaga erro do repositório", async () => {
    const criarRefreshToken = criarCriarRefreshToken({
      tokensRepo: {
        async inserir() {
          return {
            ok: false as const,
            error: {
              codigo: "ERRO_INTERNO",
              mensagem: "Falha ao inserir",
            },
          };
        },
        async buscarPorHash() {
          throw new Error("não usado");
        },
        async buscarPorId() {
          throw new Error("não usado");
        },
        async revogar() {
          throw new Error("não usado");
        },
      },
      cripto: {
        async gerarTokenSeguro() {
          return { ok: true as const, value: "refresh-bruto-1" };
        },
        async hashToken(tokenBruto: string) {
          return { ok: true as const, value: `hash:${tokenBruto}` };
        },
      },
      ids: {
        gerarId() {
          return "token-1";
        },
      },
    });

    const r = await criarRefreshToken({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
      agora: new Date(),
      ttlMs: 1000,
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("ERRO_INTERNO");
    }
  });
});