// packages/core/__tests__/tokens/tokens.revogarToken.test.ts

import { describe, it, expect } from "vitest";
import { criarRepositorioTokensMemoria, criarToken, revogarToken, type TokenId } from "../../src/tokens";
import { UsuarioId } from "../../src/usuarios";

const asTokenId = (v: string) => v as unknown as TokenId;
const asUsuarioId = (v: string) => v as unknown as UsuarioId;

describe("tokens/usecases/revogarToken", () => {
  it("deve revogar token ativo", async () => {
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

    const r = await revogarToken({ repo, tokenId: asTokenId("t1"), agora: () => agora });
    expect(r.ok).toBe(true);

    const r2 = await repo.obterPorId(asTokenId("t1"));
    expect(r2.ok).toBe(true);
    if (r2.ok) {
      expect(r2.value?.revogadoEm?.toISOString()).toBe(agora.toISOString());
    }
  });

  it("deve retornar NAO_ENCONTRADO se token não existe", async () => {
    const repo = criarRepositorioTokensMemoria();

    const r = await revogarToken({ repo, tokenId: asTokenId("x"), agora: () => new Date() });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.codigo).toBe("NAO_ENCONTRADO");
  });

  it("deve retornar CONFLITO se token já revogado", async () => {
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

    const r = await revogarToken({ repo, tokenId: asTokenId("t1"), agora: () => new Date() });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.codigo).toBe("CONFLITO");
  });
});