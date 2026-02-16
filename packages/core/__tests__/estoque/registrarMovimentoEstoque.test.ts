import { describe, it, expect } from "vitest";
import { registrarMovimentoEstoque } from "../../src/estoque/usecases/registrarMovimentoEstoque";
import { wrapOk, wrapErr } from "../../src/result";
import { erroApp } from "../../src/erros";

describe("Estoque > registrarMovimentoEstoque", () => {
  it("deve impedir movimento para SERVICO", async () => {
    const repositorioItens = {
      buscarItemPorId: async () =>
        wrapOk({ id: "i1", tipoItem: "SERVICO", ativo: true, excluidoEm: null }),
    };

    const repositorioEstoque = {
      garantirEstoquePadrao: async () => wrapOk({ estoqueId: "e1" }),
      registrarMovimentoEAtualizarSaldo: async () => wrapOk({ movimentoId: "m1" }),
    };

    const ctx = { locatarioId: "l1", usuarioId: "u1", permissoes: ["ESTOQUE_ESCRITA"] };

    const r = await registrarMovimentoEstoque(ctx as any, repositorioEstoque as any, repositorioItens as any, {
      itemId: "i1",
      tipo: "ENTRADA",
      delta: 10,
    });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALIDO");
  });

  it("ENTRADA exige delta > 0", async () => {
    const repositorioItens = {
      buscarItemPorId: async () =>
        wrapOk({ id: "i1", tipoItem: "PRODUTO", ativo: true, excluidoEm: null }),
    };

    const repositorioEstoque = {
      garantirEstoquePadrao: async () => wrapOk({ estoqueId: "e1" }),
      registrarMovimentoEAtualizarSaldo: async () => wrapOk({ movimentoId: "m1" }),
    };

    const ctx = { locatarioId: "l1", usuarioId: "u1", permissoes: ["ESTOQUE_ESCRITA"] };

    const r = await registrarMovimentoEstoque(ctx as any, repositorioEstoque as any, repositorioItens as any, {
      itemId: "i1",
      tipo: "ENTRADA",
      delta: -1,
    });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALIDO");
  });

  it("SAIDA exige delta < 0", async () => {
    const repositorioItens = {
      buscarItemPorId: async () =>
        wrapOk({ id: "i1", tipoItem: "PRODUTO", ativo: true, excluidoEm: null }),
    };

    const repositorioEstoque = {
      garantirEstoquePadrao: async () => wrapOk({ estoqueId: "e1" }),
      registrarMovimentoEAtualizarSaldo: async () => wrapOk({ movimentoId: "m1" }),
    };

    const ctx = { locatarioId: "l1", usuarioId: "u1", permissoes: ["ESTOQUE_ESCRITA"] };

    const r = await registrarMovimentoEstoque(ctx as any, repositorioEstoque as any, repositorioItens as any, {
      itemId: "i1",
      tipo: "SAIDA",
      delta: 5,
    });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALIDO");
  });

  it("AJUSTE aceita delta positivo ou negativo (mas não zero)", async () => {
    const repositorioItens = {
      buscarItemPorId: async () =>
        wrapOk({ id: "i1", tipoItem: "PRODUTO", ativo: true, excluidoEm: null }),
    };

    const repositorioEstoque = {
      garantirEstoquePadrao: async () => wrapOk({ estoqueId: "e1" }),
      registrarMovimentoEAtualizarSaldo: async () => wrapOk({ movimentoId: "m1" }),
    };

    const ctx = { locatarioId: "l1", usuarioId: "u1", permissoes: ["ESTOQUE_ESCRITA"] };

    const r = await registrarMovimentoEstoque(ctx as any, repositorioEstoque as any, repositorioItens as any, {
      itemId: "i1",
      tipo: "AJUSTE",
      delta: -3,
    });

    expect(r.ok).toBe(true);
  });

  it("deve propagar erro do repositório (ex: saldo insuficiente)", async () => {
    const repositorioItens = {
      buscarItemPorId: async () =>
        wrapOk({ id: "i1", tipoItem: "PRODUTO", ativo: true, excluidoEm: null }),
    };

    const repositorioEstoque = {
      garantirEstoquePadrao: async () => wrapOk({ estoqueId: "e1" }),
      registrarMovimentoEAtualizarSaldo: async () =>
        wrapErr(erroApp("CONFLITO", "Saldo insuficiente")),
    };

    const ctx = { locatarioId: "l1", usuarioId: "u1", permissoes: ["ESTOQUE_ESCRITA"] };

    const r = await registrarMovimentoEstoque(ctx as any, repositorioEstoque as any, repositorioItens as any, {
      itemId: "i1",
      tipo: "SAIDA",
      delta: -999,
    });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("CONFLITO");
  });
});
