import { describe, it, expect } from "vitest";
import { obterSaldoEstoque } from "../../src/estoque/usecases/obterSaldoEstoque";
import { wrapOk } from "../../src/result";

describe("Estoque > obterSaldoEstoque", () => {
  it("deve obter saldo do item no estoque padrão quando estoqueId não for informado", async () => {
    const repositorioEstoque = {
      garantirEstoquePadrao: async () => wrapOk({ estoqueId: "e1" }),
      obterSaldo: async () => wrapOk({ quantidade: 10 }),
    };

    const ctx = { locatarioId: "l1", permissoes: ["ESTOQUE_LEITURA"] };

    const r = await obterSaldoEstoque(ctx as any, repositorioEstoque as any, { itemId: "i1" });

    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.quantidade).toBe(10);
  });
});
