// packages/core/__tests__/produtos/criarProduto.test.ts

import { describe, expect, it } from "vitest";
import { createFnCriarProduto } from "../../src/produtos/usecases/criarProduto";
import { criarProdutosSimulacroRepositorio } from "./simulacros/produtosSimulacroRepositorio";
import { criarIdPortaSequencial, DATA_TESTE, relogioTeste } from "./helpers/produtosUsecaseTestUtils";

describe("#1 - createFnCriarProduto", () => {
  it("#1.1 - deve criar produto válido", async () => {
    const repo = criarProdutosSimulacroRepositorio();
    const usecase = createFnCriarProduto({
      produtosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["prod-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      nome: "Produto A",
      tipo: "PRODUTO",
      unidade: "UN",
      precoVenda: 20,
      custoReferencia: 10,
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.produtoId).toBe("prod-1");
    expect(repo.dump()[0]?.criadoEm).toEqual(DATA_TESTE);
  });

  it("#1.2 - deve falhar quando nome é inválido", async () => {
    const repo = criarProdutosSimulacroRepositorio();
    const usecase = createFnCriarProduto({ produtosRepositorio: repo, idPorta: criarIdPortaSequencial(["prod-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", nome: " ", tipo: "PRODUTO", unidade: "UN" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando preço é negativo", async () => {
    const repo = criarProdutosSimulacroRepositorio();
    const usecase = createFnCriarProduto({ produtosRepositorio: repo, idPorta: criarIdPortaSequencial(["prod-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", nome: "Produto A", tipo: "PRODUTO", unidade: "UN", precoVenda: -1 });
    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve usar preço zero quando precoVenda não é informado", async () => {
    const repo = criarProdutosSimulacroRepositorio();
    const usecase = createFnCriarProduto({ produtosRepositorio: repo, idPorta: criarIdPortaSequencial(["prod-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", nome: "Produto A", tipo: "SERVICO", unidade: "UN" });
    expect(resultado.ok).toBe(true);
    expect(repo.dump()[0]?.precoVenda).toBe(0);
  });

  it("#1.5 - deve propagar falha do repositório ao criar", async () => {
    const repo = criarProdutosSimulacroRepositorio();
    repo.simularFalha("criar");
    const usecase = createFnCriarProduto({ produtosRepositorio: repo, idPorta: criarIdPortaSequencial(["prod-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", nome: "Produto A", tipo: "PRODUTO", unidade: "UN" });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
