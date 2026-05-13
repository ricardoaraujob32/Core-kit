// packages/core/__tests__/produtos/atualizarProduto.test.ts

import { describe, expect, it } from "vitest";
import { createFnAtualizarProduto } from "../../src/produtos/usecases/atualizarProduto";
import { criarProdutoTeste, criarProdutosSimulacroRepositorio } from "./simulacros/produtosSimulacroRepositorio";
import { DATA_TESTE, relogioTeste } from "./helpers/produtosUsecaseTestUtils";

describe("#1 - createFnAtualizarProduto", () => {
  it("#1.1 - deve atualizar produto existente", async () => {
    const repo = criarProdutosSimulacroRepositorio([criarProdutoTeste({ produtoId: "prod-1", locatarioId: "loc-1" })]);
    const usecase = createFnAtualizarProduto({ produtosRepositorio: repo, relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", produtoId: "prod-1", sku: "SKU-1", nome: "Novo", precoVenda: 30 });
    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.produto.nome).toBe("Novo");
      expect(resultado.value.produto.precoVenda).toBe(30);
      expect(resultado.value.produto.atualizadoEm).toEqual(DATA_TESTE);
    }
  });

  it("#1.2 - deve preservar campos não informados", async () => {
    const repo = criarProdutosSimulacroRepositorio([criarProdutoTeste({ produtoId: "prod-1", locatarioId: "loc-1", nome: "Original", precoVenda: 10 })]);
    const usecase = createFnAtualizarProduto({ produtosRepositorio: repo, relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", produtoId: "prod-1", sku: "SKU-1" });
    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.produto.nome).toBe("Original");
      expect(resultado.value.produto.precoVenda).toBe(10);
    }
  });

  it("#1.3 - deve falhar quando produto não existe", async () => {
    const usecase = createFnAtualizarProduto({ produtosRepositorio: criarProdutosSimulacroRepositorio(), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", produtoId: "prod-x", sku: "SKU-1" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando preço é inválido", async () => {
    const repo = criarProdutosSimulacroRepositorio([criarProdutoTeste({ produtoId: "prod-1", locatarioId: "loc-1" })]);
    const usecase = createFnAtualizarProduto({ produtosRepositorio: repo, relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", produtoId: "prod-1", sku: "SKU-1", precoVenda: -1 });
    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório ao atualizar", async () => {
    const repo = criarProdutosSimulacroRepositorio([criarProdutoTeste({ produtoId: "prod-1", locatarioId: "loc-1" })]);
    repo.simularFalha("atualizar");
    const usecase = createFnAtualizarProduto({ produtosRepositorio: repo, relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", produtoId: "prod-1", sku: "SKU-1" });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
