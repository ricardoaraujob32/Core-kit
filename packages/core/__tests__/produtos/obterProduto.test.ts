// packages/core/__tests__/produtos/obterProduto.test.ts

import { describe, expect, it } from "vitest";
import { createFnObterProduto } from "../../src/produtos/usecases/obterProduto";
import { criarProdutoTeste, criarProdutosSimulacroRepositorio } from "./simulacros/produtosSimulacroRepositorio";

describe("#1 - createFnObterProduto", () => {
  it("#1.1 - deve obter produto existente", async () => {
    const repo = criarProdutosSimulacroRepositorio([criarProdutoTeste({ produtoId: "prod-1", locatarioId: "loc-1" })]);
    const usecase = createFnObterProduto({ produtosRepositorio: repo });
    const resultado = await usecase({ locatarioId: "loc-1", produtoId: "prod-1" });
    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.produto.produtoId).toBe("prod-1");
  });

  it("#1.2 - deve falhar quando produto não existe", async () => {
    const usecase = createFnObterProduto({ produtosRepositorio: criarProdutosSimulacroRepositorio() });
    const resultado = await usecase({ locatarioId: "loc-1", produtoId: "prod-x" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando produto pertence a outro locatário", async () => {
    const repo = criarProdutosSimulacroRepositorio([criarProdutoTeste({ produtoId: "prod-1", locatarioId: "loc-2" })]);
    const usecase = createFnObterProduto({ produtosRepositorio: repo });
    const resultado = await usecase({ locatarioId: "loc-1", produtoId: "prod-1" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando produto está excluído logicamente", async () => {
    const repo = criarProdutosSimulacroRepositorio([criarProdutoTeste({ produtoId: "prod-1", locatarioId: "loc-1", excluidoEm: new Date() })]);
    const usecase = createFnObterProduto({ produtosRepositorio: repo });
    const resultado = await usecase({ locatarioId: "loc-1", produtoId: "prod-1" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório", async () => {
    const repo = criarProdutosSimulacroRepositorio();
    repo.simularFalha("buscarPorId");
    const usecase = createFnObterProduto({ produtosRepositorio: repo });
    const resultado = await usecase({ locatarioId: "loc-1", produtoId: "prod-1" });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
