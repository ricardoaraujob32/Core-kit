// packages/core/__tests__/produtos/excluirProduto.test.ts

import { describe, expect, it } from "vitest";
import { createFnExcluirProduto } from "../../src/produtos/usecases/excluirProduto";
import { criarProdutoTeste, criarProdutosSimulacroRepositorio } from "./simulacros/produtosSimulacroRepositorio";
import { DATA_TESTE, relogioTeste } from "./helpers/produtosUsecaseTestUtils";

describe("#1 - createFnExcluirProduto", () => {
  it("#1.1 - deve excluir logicamente produto existente", async () => {
    const repo = criarProdutosSimulacroRepositorio([criarProdutoTeste({ produtoId: "prod-1", locatarioId: "loc-1" })]);
    const usecase = createFnExcluirProduto({ produtosRepositorio: repo, relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", produtoId: "prod-1", excluidoPor: "usr-1", excluidoMotivo: " motivo " });
    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.produto.excluidoEm).toEqual(DATA_TESTE);
      expect(resultado.value.produto.excluidoMotivo).toBe("motivo");
    }
  });

  it("#1.2 - deve normalizar motivo vazio para null", async () => {
    const repo = criarProdutosSimulacroRepositorio([criarProdutoTeste({ produtoId: "prod-1", locatarioId: "loc-1" })]);
    const usecase = createFnExcluirProduto({ produtosRepositorio: repo, relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", produtoId: "prod-1", excluidoMotivo: " " });
    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.produto.excluidoMotivo).toBeNull();
  });

  it("#1.3 - deve falhar quando produto não existe", async () => {
    const usecase = createFnExcluirProduto({ produtosRepositorio: criarProdutosSimulacroRepositorio(), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", produtoId: "prod-x" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando produto já está excluído", async () => {
    const repo = criarProdutosSimulacroRepositorio([criarProdutoTeste({ produtoId: "prod-1", locatarioId: "loc-1", excluidoEm: new Date() })]);
    const usecase = createFnExcluirProduto({ produtosRepositorio: repo, relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", produtoId: "prod-1" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório ao atualizar", async () => {
    const repo = criarProdutosSimulacroRepositorio([criarProdutoTeste({ produtoId: "prod-1", locatarioId: "loc-1" })]);
    repo.simularFalha("atualizar");
    const usecase = createFnExcluirProduto({ produtosRepositorio: repo, relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", produtoId: "prod-1" });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
