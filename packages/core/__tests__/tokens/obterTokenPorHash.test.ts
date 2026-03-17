import { describe, expect, it } from "vitest";
import { criarObterTokenPorHash } from "../usecases/obterTokenPorHash";
import {
  criarTokenSeed,
  criarTokensRepositorioMemoria,
} from "../repositorioMemoria";

describe("obterTokenPorHash", () => {
  it("obtém token válido por hash", async () => {
    const repo = criarTokensRepositorioMemoria([
      criarTokenSeed({
        tokenId: "tok-1",
        usuarioId: "user-1",
        locatarioId: "loc-1",
        hashToken: "hash_token_super_unico_123456",
        expiraEm: new Date("2026-12-31T00:00:00.000Z"),
      }),
    ]);

    const usecase = criarObterTokenPorHash({
      tokensRepo: repo,
      agora: () => new Date("2026-03-12T12:00:00.000Z"),
    });

    const resultado = await usecase({
      hashToken: "hash_token_super_unico_123456",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.tokenId).toBe("tok-1");
  });

  it("falha para token revogado", async () => {
    const repo = criarTokensRepositorioMemoria([
      criarTokenSeed({
        tokenId: "tok-1",
        usuarioId: "user-1",
        locatarioId: "loc-1",
        hashToken: "hash_token_super_unico_123456",
        revogadoEm: new Date("2026-03-11T12:00:00.000Z"),
      }),
    ]);

    const usecase = criarObterTokenPorHash({
      tokensRepo: repo,
      agora: () => new Date("2026-03-12T12:00:00.000Z"),
    });

    const resultado = await usecase({
      hashToken: "hash_token_super_unico_123456",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("TOKEN_REVOGADO");
  });
});