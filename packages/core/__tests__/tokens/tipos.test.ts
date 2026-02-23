// packages/core/__tests__/tokens/tipos.test.ts

import { describe, it, expect } from "vitest";
import { criarToken, tokenEstaAtivo, tokenEstaExpirado, tokenEstaRevogado } from "../../src/tokens/tipos";

describe("tokens/tipos", () => {
  it("criarToken deve retornar Ok para params válidos", () => {
    const emitidoEm = new Date("2026-01-01T00:00:00.000Z");
    const expiraEm = new Date("2026-01-02T00:00:00.000Z");

    const r = criarToken({
      id: "t1" as any,
      usuarioId: "u1" as any,
      locatarioId: null,
      hashToken: "hash",
      emitidoEm,
      expiraEm,
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.id).toBe("t1");
      expect(r.value.usuarioId).toBe("u1");
      expect(r.value.locatarioId).toBe(null);
      expect(r.value.hashToken).toBe("hash");
      expect(r.value.revogadoEm).toBe(null);
      expect(r.value.proximoTokenId).toBe(null);
    }
  });

  it("criarToken deve retornar Err se expiraEm <= emitidoEm", () => {
    const emitidoEm = new Date("2026-01-01T00:00:00.000Z");
    const expiraEm = new Date("2026-01-01T00:00:00.000Z");

    const r = criarToken({
      id: "t1" as any,
      usuarioId: "u1" as any,
      hashToken: "hash",
      emitidoEm,
      expiraEm,
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("INVALIDO");
    }
  });

  it("token helpers: revogado/expirado/ativo", () => {
    const agora = new Date("2026-01-01T12:00:00.000Z");

    const base = {
      id: "t1" as any,
      usuarioId: "u1" as any,
      locatarioId: null,
      hashToken: "hash",
      emitidoEm: new Date("2026-01-01T00:00:00.000Z"),
      expiraEm: new Date("2026-01-02T00:00:00.000Z"),
      revogadoEm: null,
      proximoTokenId: null,
      agenteUsuario: null,
      enderecoIp: null,
    };

    expect(tokenEstaRevogado(base as any)).toBe(false);
    expect(tokenEstaExpirado(base as any, agora)).toBe(false);
    expect(tokenEstaAtivo(base as any, agora)).toBe(true);

    const revogado = { ...base, revogadoEm: new Date("2026-01-01T01:00:00.000Z") };
    expect(tokenEstaRevogado(revogado as any)).toBe(true);
    expect(tokenEstaAtivo(revogado as any, agora)).toBe(false);

    const expirado = { ...base, expiraEm: new Date("2026-01-01T11:59:59.000Z") };
    expect(tokenEstaExpirado(expirado as any, agora)).toBe(true);
    expect(tokenEstaAtivo(expirado as any, agora)).toBe(false);
  });
});