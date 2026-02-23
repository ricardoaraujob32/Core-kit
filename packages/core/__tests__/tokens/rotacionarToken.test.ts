// packages/core/__tests__/tokens/tokens.rotacionarToken.test.ts

import { describe, it, expect } from "vitest";
import { criarRepositorioTokensMemoria, criarToken, rotacionarToken, type TokenId } from "../../src/tokens";
import { UsuarioId } from "../../src/usuarios";

const asTokenId = (v: string) => v as unknown as TokenId;
const asUsuarioId = (v: string) => v as unknown as UsuarioId;

describe("tokens/usecases/rotacionarToken", () => {
  it("deve rotacionar token ativo (cria novo e revoga o antigo)", async () => {
    const emitido = new Date("2026-01-01T00:00:00.000Z");
    const agora = new Date("2026-01-01T10:00:00.000Z");
    const expiraAtual = new Date("2026-01-02T00:00:00.000Z");
    const expiraNovo = new Date("2026-01-03T00:00:00.000Z");

    const tAtual = criarToken({
      id: asTokenId("t1"),
      usuarioId: asUsuarioId("u1"),
      locatarioId: null,
      hashToken: "hash1",
      emitidoEm: emitido,
      expiraEm: expiraAtual,
    });

    expect(tAtual.ok).toBe(true);
    if (!tAtual.ok) return;

    const repo = criarRepositorioTokensMemoria([tAtual.value]);

    const r = await rotacionarToken({
      repo,
      tokenAtualId: asTokenId("t1"),
      novoHashToken: "hash2",
      expiraEm: expiraNovo,
      gerarTokenId: () => asTokenId("t2"),
      agora: () => agora,
    });

    expect(r.ok).toBe(true);
    if (!r.ok) return;

    expect(r.value.tokenNovo.id).toBe("t2");
    expect(r.value.tokenAnteriorId).toBe("t1");

    const antigo = await repo.obterPorId(asTokenId("t1"));
    expect(antigo.ok).toBe(true);
    if (antigo.ok) {
      expect(antigo.value?.revogadoEm?.toISOString()).toBe(agora.toISOString());
      expect(antigo.value?.proximoTokenId).toBe("t2");
    }

    const novo = await repo.obterPorId(asTokenId("t2"));
    expect(novo.ok).toBe(true);
    if (novo.ok) {
      expect(novo.value?.revogadoEm).toBeNull();
      expect(novo.value?.proximoTokenId).toBeNull();
      expect(novo.value?.hashToken).toBe("hash2");
    }
  });

  it("deve falhar com NAO_ENCONTRADO se token atual não existe", async () => {
    const repo = criarRepositorioTokensMemoria();

    const r = await rotacionarToken({
      repo,
      tokenAtualId: asTokenId("nao-existe"),
      novoHashToken: "hash2",
      expiraEm: new Date("2026-01-03T00:00:00.000Z"),
      gerarTokenId: () => asTokenId("t2"),
      agora: () => new Date("2026-01-01T10:00:00.000Z"),
    });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.codigo).toBe("NAO_ENCONTRADO");
  });

  it("deve falhar com INVALIDO se token atual estiver revogado", async () => {
    const emitido = new Date("2026-01-01T00:00:00.000Z");
    const expiraAtual = new Date("2026-01-02T00:00:00.000Z");

    const tAtual = criarToken({
      id: asTokenId("t1"),
      usuarioId: asUsuarioId("u1"),
      locatarioId: null,
      hashToken: "hash1",
      emitidoEm: emitido,
      expiraEm: expiraAtual,
      revogadoEm: new Date("2026-01-01T05:00:00.000Z"),
    });

    expect(tAtual.ok).toBe(true);
    if (!tAtual.ok) return;

    const repo = criarRepositorioTokensMemoria([tAtual.value]);

    const r = await rotacionarToken({
      repo,
      tokenAtualId: asTokenId("t1"),
      novoHashToken: "hash2",
      expiraEm: new Date("2026-01-03T00:00:00.000Z"),
      gerarTokenId: () => asTokenId("t2"),
      agora: () => new Date("2026-01-01T10:00:00.000Z"),
    });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.codigo).toBe("INVALIDO");
  });

  it("deve falhar com INVALIDO se token atual estiver expirado", async () => {
    const emitido = new Date("2026-01-01T00:00:00.000Z");
    const expiraAtual = new Date("2026-01-01T01:00:00.000Z");
    const agora = new Date("2026-01-01T10:00:00.000Z");

    const tAtual = criarToken({
      id: asTokenId("t1"),
      usuarioId: asUsuarioId("u1"),
      locatarioId: null,
      hashToken: "hash1",
      emitidoEm: emitido,
      expiraEm: expiraAtual,
    });

    expect(tAtual.ok).toBe(true);
    if (!tAtual.ok) return;

    const repo = criarRepositorioTokensMemoria([tAtual.value]);

    const r = await rotacionarToken({
      repo,
      tokenAtualId: asTokenId("t1"),
      novoHashToken: "hash2",
      expiraEm: new Date("2026-01-03T00:00:00.000Z"),
      gerarTokenId: () => asTokenId("t2"),
      agora: () => agora,
    });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.codigo).toBe("INVALIDO");
  });

  it("deve falhar com CONFLITO se token atual já foi rotacionado (proximoTokenId != null)", async () => {
    const emitido = new Date("2026-01-01T00:00:00.000Z");
    const expiraAtual = new Date("2026-01-02T00:00:00.000Z");
    const agora = new Date("2026-01-01T10:00:00.000Z");

    const tAtual = criarToken({
      id: asTokenId("t1"),
      usuarioId: asUsuarioId("u1"),
      locatarioId: null,
      hashToken: "hash1",
      emitidoEm: emitido,
      expiraEm: expiraAtual,
      proximoTokenId: asTokenId("t999"),
    });

    expect(tAtual.ok).toBe(true);
    if (!tAtual.ok) return;

    const repo = criarRepositorioTokensMemoria([tAtual.value]);

    const r = await rotacionarToken({
      repo,
      tokenAtualId: asTokenId("t1"),
      novoHashToken: "hash2",
      expiraEm: new Date("2026-01-03T00:00:00.000Z"),
      gerarTokenId: () => asTokenId("t2"),
      agora: () => agora,
    });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.codigo).toBe("CONFLITO");
  });

  it("deve falhar se usuarioId informado não corresponde ao token atual", async () => {
    const emitido = new Date("2026-01-01T00:00:00.000Z");
    const expiraAtual = new Date("2026-01-02T00:00:00.000Z");
    const agora = new Date("2026-01-01T10:00:00.000Z");

    const tAtual = criarToken({
      id: asTokenId("t1"),
      usuarioId: asUsuarioId("u1"),
      locatarioId: null,
      hashToken: "hash1",
      emitidoEm: emitido,
      expiraEm: expiraAtual,
    });

    expect(tAtual.ok).toBe(true);
    if (!tAtual.ok) return;

    const repo = criarRepositorioTokensMemoria([tAtual.value]);

    const r = await rotacionarToken({
      repo,
      tokenAtualId: asTokenId("t1"),
      novoHashToken: "hash2",
      usuarioId: asUsuarioId("u2"),
      expiraEm: new Date("2026-01-03T00:00:00.000Z"),
      gerarTokenId: () => asTokenId("t2"),
      agora: () => agora,
    });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.codigo).toBe("INVALIDO");
  });
});