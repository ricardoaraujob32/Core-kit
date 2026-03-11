import { describe, it, expect } from "vitest";
import { criarValidarRefreshToken } from "../../src/tokens/usecases/validarRefreshToken";
import { criarTokensRepositorioMemoria } from "../../src/tokens/repositorioMemoria";

describe("tokens - validarRefreshToken", () => {
  it("retorna Ok quando o token é válido", async () => {
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

    const validarRefreshToken = criarValidarRefreshToken({
      tokensRepo: repo,
      cripto: {
        async gerarTokenSeguro() {
          throw new Error("não usado");
        },
        async hashToken(tokenBruto: string) {
          return { ok: true as const, value: `hash:${tokenBruto}` };
        },
      },
    });

    const r = await validarRefreshToken({
      locatarioId: "tenant-1",
      tokenBruto: "refresh-bruto-1",
      agora: new Date("2026-03-06T12:30:00.000Z"),
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.tokenId).toBe("token-1");
      expect(r.value.usuarioId).toBe("user-1");
    }
  });

  it("retorna Err(NAO_AUTENTICADO) quando token não existe", async () => {
    const repo = criarTokensRepositorioMemoria();

    const validarRefreshToken = criarValidarRefreshToken({
      tokensRepo: repo,
      cripto: {
        async gerarTokenSeguro() {
          throw new Error("não usado");
        },
        async hashToken(tokenBruto: string) {
          return { ok: true as const, value: `hash:${tokenBruto}` };
        },
      },
    });

    const r = await validarRefreshToken({
      locatarioId: "tenant-1",
      tokenBruto: "nao-existe",
      agora: new Date(),
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTENTICADO");
    }
  });

  it("retorna Err(NAO_AUTENTICADO) quando token está revogado", async () => {
    const repo = criarTokensRepositorioMemoria([
      {
        tokenId: "token-1",
        locatarioId: "tenant-1",
        usuarioId: "user-1",
        tipo: "REFRESH",
        hashToken: "hash:refresh-bruto-1",
        expiraEm: new Date("2026-03-07T12:00:00.000Z"),
        revogadoEm: new Date("2026-03-06T12:10:00.000Z"),
        criadoEm: new Date("2026-03-06T12:00:00.000Z"),
        proximoTokenId: null,
        proximoUsuarioId: null,
      },
    ]);

    const validarRefreshToken = criarValidarRefreshToken({
      tokensRepo: repo,
      cripto: {
        async gerarTokenSeguro() {
          throw new Error("não usado");
        },
        async hashToken(tokenBruto: string) {
          return { ok: true as const, value: `hash:${tokenBruto}` };
        },
      },
    });

    const r = await validarRefreshToken({
      locatarioId: "tenant-1",
      tokenBruto: "refresh-bruto-1",
      agora: new Date("2026-03-06T12:30:00.000Z"),
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTENTICADO");
    }
  });

  it("retorna Err(NAO_AUTENTICADO) quando token está expirado", async () => {
    const repo = criarTokensRepositorioMemoria([
      {
        tokenId: "token-1",
        locatarioId: "tenant-1",
        usuarioId: "user-1",
        tipo: "REFRESH",
        hashToken: "hash:refresh-bruto-1",
        expiraEm: new Date("2026-03-06T12:00:00.000Z"),
        revogadoEm: null,
        criadoEm: new Date("2026-03-06T10:00:00.000Z"),
        proximoTokenId: null,
        proximoUsuarioId: null,
      },
    ]);

    const validarRefreshToken = criarValidarRefreshToken({
      tokensRepo: repo,
      cripto: {
        async gerarTokenSeguro() {
          throw new Error("não usado");
        },
        async hashToken(tokenBruto: string) {
          return { ok: true as const, value: `hash:${tokenBruto}` };
        },
      },
    });

    const r = await validarRefreshToken({
      locatarioId: "tenant-1",
      tokenBruto: "refresh-bruto-1",
      agora: new Date("2026-03-06T12:30:00.000Z"),
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTENTICADO");
    }
  });

  it("retorna Err(CONFLITO) quando detecta replay em rotação encadeada", async () => {
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
        proximoTokenId: "token-2",
        proximoUsuarioId: "user-1",
      },
    ]);

    const validarRefreshToken = criarValidarRefreshToken({
      tokensRepo: repo,
      cripto: {
        async gerarTokenSeguro() {
          throw new Error("não usado");
        },
        async hashToken(tokenBruto: string) {
          return { ok: true as const, value: `hash:${tokenBruto}` };
        },
      },
      detectarReplayRotacao: true,
    });

    const r = await validarRefreshToken({
      locatarioId: "tenant-1",
      tokenBruto: "refresh-bruto-1",
      agora: new Date("2026-03-06T12:30:00.000Z"),
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("CONFLITO");
    }
  });
});