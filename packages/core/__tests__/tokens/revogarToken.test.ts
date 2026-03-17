import { describe, expect, it } from "vitest";
import { criarRevogarToken } from "../usecases/revogarToken";
import {
  criarTokenSeed,
  criarTokensRepositorioMemoria,
} from "../repositorioMemoria";

describe("revogarToken", () => {
  it("revoga token ativo", async () => {
    const repo = criarTokensRepositorioMemoria([
      criarTokenSeed({
        tokenId: "tok-1",
        usuarioId: "user-1",
        locatarioId: "loc-1",
        hashToken: "hash_1_1234567890123456",
        revogadoEm: null,
      }),
    ]);

    const usecase = criarRevogarToken({
      tokensRepo: repo,
      relogio: { agora: () => new Date("2026-03-12T13:00:00.000Z") },
    });

    const resultado = await usecase({ tokenId: "tok-1" });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.revogadoEm).not.toBeNull();
  });
});