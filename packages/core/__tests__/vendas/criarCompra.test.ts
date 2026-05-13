// packages/core/__tests__/vendas/criarCompra.test.ts

import { describe, expect, it } from "vitest";
import { createFnCriarCompra } from "../../src/vendas/usecases/criarCompra";
import { criarVendasSimulacroRepositorio } from "./simulacros/vendasSimulacroRepositorio";
import { criarIdPortaSequencial, DATA_TESTE, relogioTeste } from "./helpers/vendasUsecaseTestUtils";

describe("#1 - createFnCriarCompra", () => {
  it("#1.1 - deve criar compra em RASCUNHO e registrar histórico", async () => {
    const repo = criarVendasSimulacroRepositorio();
    const usecase = createFnCriarCompra({ vendasRepositorio: repo, idPorta: criarIdPortaSequencial(["trx-1", "hist-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", fornecedorId: "for-1", usuarioId: "usr-1" });
    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.transacaoId).toBe("trx-1");
    expect(repo.dump().transacoes[0]?.tipo).toBe("COMPRA");
    expect(repo.dump().transacoes[0]?.status).toBe("RASCUNHO");
    expect(repo.dump().transacoes[0]?.criadoEm).toEqual(DATA_TESTE);
    expect(repo.dump().historico).toHaveLength(1);
  });

  it("#1.2 - deve falhar quando locatarioId é inválido", async () => {
    const usecase = createFnCriarCompra({ vendasRepositorio: criarVendasSimulacroRepositorio(), idPorta: criarIdPortaSequencial(["trx-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: " ", usuarioId: "usr-1" } as never);
    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve propagar falha ao criar transação", async () => {
    const repo = criarVendasSimulacroRepositorio();
    repo.simularFalha("criarTransacao");
    const usecase = createFnCriarCompra({ vendasRepositorio: repo, idPorta: criarIdPortaSequencial(["trx-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", usuarioId: "usr-1" });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });

  it("#1.4 - deve propagar falha ao criar histórico", async () => {
    const repo = criarVendasSimulacroRepositorio();
    repo.simularFalha("criarHistorico");
    const usecase = createFnCriarCompra({ vendasRepositorio: repo, idPorta: criarIdPortaSequencial(["trx-1", "hist-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", usuarioId: "usr-1" });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
