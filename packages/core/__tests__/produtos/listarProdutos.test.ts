// packages/core/__tests__/produtos/listarProdutos.test.ts

import { describe, expect, it } from "vitest";
import { createFnListarProdutos } from "../../src/produtos/usecases/listarProdutos";
import { criarProdutoTeste, criarProdutosSimulacroRepositorio } from "./simulacros/produtosSimulacroRepositorio";

describe("#1 - createFnListarProdutos", () => {
  it("#1.1 - deve listar produtos do locatário", async () => {
    const repo = criarProdutosSimulacroRepositorio([
      criarProdutoTeste({ produtoId: "prod-1", locatarioId: "loc-1" }),
      criarProdutoTeste({ produtoId: "prod-2", locatarioId: "loc-1" }),
      criarProdutoTeste({ produtoId: "prod-3", locatarioId: "loc-2" }),
    ]);
    const usecase = createFnListarProdutos({ produtosRepositorio: repo });
    const resultado = await usecase({ locatarioId: "loc-1" });
    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.itens.map((p) => p.produtoId)).toEqual(["prod-1", "prod-2"]);
  });

  it("#1.2 - deve filtrar por tipo", async () => {
    const repo = criarProdutosSimulacroRepositorio([
      criarProdutoTeste({ produtoId: "prod-1", locatarioId: "loc-1", tipo: "PRODUTO" }),
      criarProdutoTeste({ produtoId: "serv-1", locatarioId: "loc-1", tipo: "SERVICO" }),
    ]);
    const usecase = createFnListarProdutos({ produtosRepositorio: repo });
    const resultado = await usecase({ locatarioId: "loc-1", tipo: "SERVICO" });
    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.itens.map((p) => p.produtoId)).toEqual(["serv-1"]);
  });

  it("#1.3 - deve respeitar cursor e limite", async () => {
    const repo = criarProdutosSimulacroRepositorio([
      criarProdutoTeste({ produtoId: "prod-1", locatarioId: "loc-1" }),
      criarProdutoTeste({ produtoId: "prod-2", locatarioId: "loc-1" }),
      criarProdutoTeste({ produtoId: "prod-3", locatarioId: "loc-1" }),
    ]);
    const usecase = createFnListarProdutos({ produtosRepositorio: repo });
    const resultado = await usecase({ locatarioId: "loc-1", cursor: "prod-1", limite: 1 });
    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.itens.map((p) => p.produtoId)).toEqual(["prod-2"]);
  });

  it("#1.4 - deve falhar quando tipo é inválido", async () => {
    const usecase = createFnListarProdutos({ produtosRepositorio: criarProdutosSimulacroRepositorio() });
    const resultado = await usecase({ locatarioId: "loc-1", tipo: "INVALIDO" as never });
    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório", async () => {
    const repo = criarProdutosSimulacroRepositorio();
    repo.simularFalha("listarPorLocatario");
    const usecase = createFnListarProdutos({ produtosRepositorio: repo });
    const resultado = await usecase({ locatarioId: "loc-1" });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
