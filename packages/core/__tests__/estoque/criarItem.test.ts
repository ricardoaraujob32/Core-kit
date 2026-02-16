import { describe, it, expect } from "vitest";
import { criarItem } from "../../src/estoque/usecases/criarItem";
import { wrapOk, wrapErr } from "../../src/result";
import { erroApp } from "../../src/erros";

describe("Estoque > criarItem", () => {
  it("deve criar um PRODUTO válido", async () => {
    const repositorioItens = {
      criarItem: async () => wrapOk({ id: "i1" }),
    };

    const ctx = { locatarioId: "l1", permissoes: ["ESTOQUE_ESCRITA"] };

    const r = await criarItem(ctx as any, repositorioItens as any, {
      tipoItem: "PRODUTO",
      nome: "Arroz",
      unidade: "UN",
      sku: "ARROZ-1",
    });

    expect(r.ok).toBe(true);
  });

  it("deve falhar se o usuário não tiver permissão", async () => {
    const repositorioItens = { criarItem: async () => wrapOk({ id: "i1" }) };
    const ctx = { locatarioId: "l1", permissoes: [] };

    const r = await criarItem(ctx as any, repositorioItens as any, {
      tipoItem: "PRODUTO",
      nome: "Arroz",
      unidade: "UN",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("NAO_AUTORIZADO");
      expect(r.error.message).toBe("Permissões insuficientes");
    }
  });

  it("deve falhar se nome estiver vazio", async () => {
    const repositorioItens = { criarItem: async () => wrapOk({ id: "i1" }) };
    const ctx = { locatarioId: "l1", permissoes: ["ESTOQUE_ESCRITA"] };

    const r = await criarItem(ctx as any, repositorioItens as any, {
      tipoItem: "PRODUTO",
      nome: "   ",
      unidade: "UN",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALIDO");
  });

  it("deve propagar conflito do repositório (sku duplicado)", async () => {
    const repositorioItens = {
      criarItem: async () => wrapErr(erroApp("CONFLITO", "SKU já existe")),
    };
    const ctx = { locatarioId: "l1", permissoes: ["ESTOQUE_ESCRITA"] };

    const r = await criarItem(ctx as any, repositorioItens as any, {
      tipoItem: "PRODUTO",
      nome: "Feijão",
      unidade: "UN",
      sku: "FJ-1",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("CONFLITO");
  });
});
