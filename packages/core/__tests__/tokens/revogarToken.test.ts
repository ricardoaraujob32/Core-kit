import { describe, it, expect } from "vitest";
import { criarRevogarToken } from "../../src/tokens/usecases/revogarToken";
import { criarTokensRepositorioMemoria } from "../../src/tokens/repositorioMemoria";

describe("tokens - revogarToken", () => {
  it("revoga token com sucesso", async () => {
    const repo = criarTokensRepositorioMemoria([
      {
        tokenId: "token-1",
        locatarioId: "tenant-1",
        usuarioId: "user-1",
        tipo: "REFRESH",
        hashToken: "hash:refresh-bruto-1",
        expiraEm: new Date("2026-03-07T12:00:00.000Z"),
        revogadoEm: null,
        criadoEm: new Date("2026-03-06T12:00:00.000Z"),
        proximoTokenId: null,
        proximoUsuarioId: null,
      },
    ]);

    const revogarToken = criarRevogarToken({
      tokensRepo: repo,
    });

    const r = await revogarToken({
      locatarioId: "tenant-1",
      tokenId: "token-1",
      usuarioId: "user-99",
      agora: new Date("2026-03-06T13:00:00.000Z"),
      motivo: "logout",
    });

    expect(r.ok).toBe(true);

    const dump = repo.dump();
    expect(dump[0].revogadoEm?.toISOString()).toBe(
      "2026-03-06T13:00:00.000Z"
    );
  });

  it("é idempotente quando token não existe", async () => {
    const repo = criarTokensRepositorioMemoria();

    const revogarToken = criarRevogarToken({
      tokensRepo: repo,
    });

    const r = await revogarToken({
      locatarioId: "tenant-1",
      tokenId: "nao-existe",
      usuarioId: "user-99",
      agora: new Date(),
    });

    expect(r.ok).toBe(true);
  });

  it("retorna Err(INVALIDO) quando tokenId é vazio", async () => {
    const repo = criarTokensRepositorioMemoria();

    const revogarToken = criarRevogarToken({
      tokensRepo: repo,
    });

    const r = await revogarToken({
      locatarioId: "tenant-1",
      tokenId: "",
      usuarioId: "user-99",
      agora: new Date(),
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("INVALIDO");
    }
  });

  it("propaga erro do repositório", async () => {
    const revogarToken = criarRevogarToken({
      tokensRepo: {
        async inserir() {
          throw new Error("não usado");
        },
        async buscarPorHash() {
          throw new Error("não usado");
        },
        async buscarPorId() {
          throw new Error("não usado");
        },
        async revogar() {
          return {
            ok: false as const,
            error: {
              codigo: "ERRO_INTERNO",
              mensagem: "Falha ao revogar",
            },
          };
        },
      },
    });

    const r = await revogarToken({
      locatarioId: "tenant-1",
      tokenId: "token-1",
      usuarioId: "user-99",
      agora: new Date(),
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("ERRO_INTERNO");
    }
  });
});