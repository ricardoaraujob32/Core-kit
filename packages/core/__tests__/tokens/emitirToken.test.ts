import { describe, expect, it } from "vitest";
import { criarEmitirToken } from "../usecases/emitirToken";
import { criarTokensRepositorioMemoria } from "../repositorioMemoria";

describe("emitirToken", () => {
  it("emite token válido", async () => {
    const repo = criarTokensRepositorioMemoria();

    const usecase = criarEmitirToken({
      tokensRepo: repo,
      idPorta: { gerarId: () => "tok-1" },
      relogio: { agora: () => new Date("2026-03-12T12:00:00.000Z") },
    });

    const resultado = await usecase({
      usuarioId: "user-1",
      locatarioId: "loc-1",
      hashToken: "hash_token_super_unico_123456",
      tipo: "ACESSO",
      expiraEm: new Date("2026-03-13T12:00:00.000Z"),
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.tokenId).toBe("tok-1");
  });

  it("falha quando hash já existe", async () => {
    const repo = criarTokensRepositorioMemoria();
    await repo.criar({
      tokenId: "tok-x",
      usuarioId: "user-1",
      locatarioId: "loc-1",
      hashToken: "hash_token_super_unico_123456",
      tipo: "ACESSO",
      emitidoEm: new Date(),
      expiraEm: new Date("2026-12-31T00:00:00.000Z"),
      revogadoEm: null,
      proximoTokenId: null,
      agenteUsuario: null,
      enderecoIp: null,
    });

    const usecase = criarEmitirToken({
      tokensRepo: repo,
      idPorta: { gerarId: () => "tok-1" },
      relogio: { agora: () => new Date("2026-03-12T12:00:00.000Z") },
    });

    const resultado = await usecase({
      usuarioId: "user-1",
      locatarioId: "loc-1",
      hashToken: "hash_token_super_unico_123456",
      tipo: "ACESSO",
      expiraEm: new Date("2026-03-13T12:00:00.000Z"),
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("TOKEN_HASH_JA_EXISTE");
  });
});