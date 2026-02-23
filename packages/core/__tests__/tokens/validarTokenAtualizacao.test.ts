// packages/core/__tests__/tokens/tokens.validarTokenAtualizacao.test.ts

import { describe, it, expect } from "vitest";
import { criarRepositorioTokensMemoria, criarToken, validarTokenAtualizacao, type TokenId } from "../../src/tokens";
import { UsuarioId } from "../../src/usuarios";

const asTokenId = (v: string) => v as unknown as TokenId;
const asUsuarioId = (v: string) => v as unknown as UsuarioId;

describe("tokens/usecases/validarTokenAtualizacao", () => {
  it("deve retornar token quando ativo", async () => {
    const emitido = new Date("2026-01-01T00:00:00.000Z");
    const expira = new Date("2026-01-02T00:00:00.000Z");
    const agora = new Date("2026-01-01T10:00:00.000Z");

    const t = criarToken({
      id: asTokenId("t1"),
      usuarioId: asUsuarioId("u1"),
      locatarioId: null,
      hashToken: "hash",
      emitidoEm: emitido,
      expiraEm: expira,
    });

    expect(t.ok).toBe(true);
    if (!t.ok) return;

    const repo = criarRepositorioTokensMemoria([t.value]);

    const r = await validarTokenAtualizacao({ repo, tokenId: asTokenId("t1"), agora: () => agora });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.id).toBe("t1");
  });

  it("deve retornar NAO_ENCONTRADO se token não existir", async () => {
    const repo = criarRepositorioTokensMemoria();
    const r = await validarTokenAtualizacao({ repo, tokenId: asTokenId("x"), agora: () => new Date() });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.codigo).toBe("NAO_ENCONTRADO");
  });

  it("deve retornar INVALIDO se token revogado", async () => {
    const emitido = new Date("2026-01-01T00:00:00.000Z");
    const expira = new Date("2026-01-02T00:00:00.000Z");

    const t = criarToken({
      id: asTokenId("t1"),
      usuarioId: asUsuarioId("u1"),
      locatarioId: null,
      hashToken: "hash",
      emitidoEm: emitido,
      expiraEm: expira,
      revogadoEm: new Date("2026-01-01T05:00:00.000Z"),
    });

    expect(t.ok).toBe(true);
    if (!t.ok) return;

    const repo = criarRepositorioTokensMemoria([t.value]);

    const r = await validarTokenAtualizacao({ repo, tokenId: asTokenId("t1"), agora: () => new Date() });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.codigo).toBe("INVALIDO");
  });

  it("deve retornar INVALIDO se token expirado", async () => {
    const emitido = new Date("2026-01-01T00:00:00.000Z");
    const expira = new Date("2026-01-01T01:00:00.000Z");
    const agora = new Date("2026-01-01T10:00:00.000Z");

    const t = criarToken({
      id: asTokenId("t1"),
      usuarioId: asUsuarioId("u1"),
      locatarioId: null,
      hashToken: "hash",
      emitidoEm: emitido,
      expiraEm: expira,
    });

    expect(t.ok).toBe(true);
    if (!t.ok) return;

    const repo = criarRepositorioTokensMemoria([t.value]);

    const r = await validarTokenAtualizacao({ repo, tokenId: asTokenId("t1"), agora: () => agora });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.codigo).toBe("INVALIDO");
  });
});