// packages/core/__tests__/vendas/obterTransacao.test.ts

import { describe, expect, it } from "vitest";
import { createFnObterTransacao } from "../../src/vendas/usecases/obterTransacao";
import { criarHistoricoTeste, criarItemTransacaoTeste, criarTransacaoTeste, criarVendasSimulacroRepositorio } from "./simulacros/vendasSimulacroRepositorio";

describe("#1 - createFnObterTransacao", () => {
  it("#1.1 - deve obter transação com itens e histórico", async () => {
    const repo = criarVendasSimulacroRepositorio({
      transacoes: [criarTransacaoTeste({ transacaoId: "trx-1", locatarioId: "loc-1" })],
      itens: [criarItemTransacaoTeste({ itemTransacaoId: "item-1", transacaoId: "trx-1", locatarioId: "loc-1" })],
      historico: [criarHistoricoTeste({ historicoId: "hist-1", transacaoId: "trx-1", locatarioId: "loc-1" })],
    });
    const usecase = createFnObterTransacao({ vendasRepositorio: repo });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1" });
    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.transacao.transacaoId).toBe("trx-1");
      expect(resultado.value.itens).toHaveLength(1);
      expect(resultado.value.historico).toHaveLength(1);
    }
  });

  it("#1.2 - deve falhar quando transação não existe", async () => {
    const usecase = createFnObterTransacao({ vendasRepositorio: criarVendasSimulacroRepositorio() });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-x" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve propagar falha ao buscar transação", async () => {
    const repo = criarVendasSimulacroRepositorio();
    repo.simularFalha("buscarTransacaoPorId");
    const usecase = createFnObterTransacao({ vendasRepositorio: repo });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1" });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });

  it("#1.4 - deve propagar falha ao listar itens", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ transacaoId: "trx-1", locatarioId: "loc-1" })] });
    repo.simularFalha("listarItens");
    const usecase = createFnObterTransacao({ vendasRepositorio: repo });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha ao listar histórico", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ transacaoId: "trx-1", locatarioId: "loc-1" })] });
    repo.simularFalha("listarHistorico");
    const usecase = createFnObterTransacao({ vendasRepositorio: repo });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1" });
    expect(resultado.ok).toBe(false);
  });
});
