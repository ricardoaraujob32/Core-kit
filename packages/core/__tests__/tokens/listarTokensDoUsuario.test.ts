import { describe, expect, it } from "vitest";
import { criarListarTokensDoUsuario } from "../usecases/listarTokensDoUsuario";
import {
  criarTokenSeed,
  criarTokensRepositorioMemoria,
} from "../repositorioMemoria";

describe("listarTokensDoUsuario", () => {
  it("lista tokens do usuário no locatário", async () => {
    const repo = criarTokensRepositorioMemoria([
      criarTokenSeed({
        tokenId: "tok-1",
        usuarioId: "user-1",
        locatarioId: "loc-1",
        hashToken: "hash_1_1234567890123456",
      }),
      criarTokenSeed({
        tokenId: "tok-2",
        usuarioId: "user-1",
        locatarioId: "loc-1",
        hashToken: "hash_2_1234567890123456",
      }),
      criarTokenSeed({
        tokenId: "tok-3",
        usuarioId: "user-1",
        locatarioId: "loc-2",
        hashToken: "hash_3_1234567890123456",
      }),
    ]);

    const usecase = criarListarTokensDoUsuario({ tokensRepo: repo });

    const resultado = await usecase({
      usuarioId: "user-1",
      locatarioId: "loc-1",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.itens).toHaveLength(2);
  });
});