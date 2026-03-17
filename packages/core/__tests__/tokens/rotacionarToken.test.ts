import { describe, expect, it } from "vitest";
import { criarRotacionarToken } from "../usecases/rotacionarToken";
import {
  criarTokenSeed,
  criarTokensRepositorioMemoria,
} from "../repositorioMemoria";

describe("rotacionarToken", () => {
  it("rotaciona token ativo", async () => {
    const repo = criarTokensRepositorioMemoria([
      criarTokenSeed({
        tokenId: "tok-1",
        usuarioId: "user-1",
        locatarioId: "loc-1",
        hashToken: "hash_antigo_1234567890123456",
        revogadoEm: null,
      }),
    ]);

    const usecase = criarRotacionarToken({
      tokensRepo: repo,
      idPorta: { gerarId: () => "tok-2" },
      relogio: { agora: () => new Date("2026-03-12T13:00:00.000Z") },
    });

    const resultado = await usecase({
      tokenId: "tok-1",
      novoHashToken: "hash_novo_1234567890123456",
      novoExpiraEm: new Date("2026-03-13T13:00:00.000Z"),
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.tokenAnterior.tokenId).toBe("tok-1");
    expect(resultado.value.tokenAnterior.proximoTokenId).toBe("tok-2");
    expect(resultado.value.tokenNovo.tokenId).toBe("tok-2");
  });
});