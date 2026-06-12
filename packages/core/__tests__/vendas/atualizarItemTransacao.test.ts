// packages/core/__tests__/vendas/atualizarItemTransacao.test.ts

import { describe, expect, it } from "vitest";
import { createFnAtualizarItemTransacao } from "../../src/vendas/usecases/atualizarItemTransacao";
import { criarItemTransacaoTeste, criarTransacaoTeste, criarVendasSimulacroRepositorio } from "./simulacros/vendasSimulacroRepositorio";
import { DATA_TESTE, relogioTeste } from "./helpers/vendasUsecaseTestUtils";

describe("#1 - createFnAtualizarItemTransacao", () => {
  it("#1.1 - deve atualizar item e recalcular totais", async () => {
    const repo = criarVendasSimulacroRepositorio({
      transacoes: [criarTransacaoTeste({ transacaoId: "trx-1", locatarioId: "loc-1", valorAcrescimo: 1 })],
      itens: [criarItemTransacaoTeste({ itemTransacaoId: "item-1", transacaoId: "trx-1", locatarioId: "loc-1" })],
    });
    const usecase = createFnAtualizarItemTransacao({ vendasRepositorio: repo, relogio: relogioTeste });

    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1", itemTransacaoId: "item-1", quantidade: 3, valorUnitario: 10, valorDesconto: 2 });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.item.valorTotal).toBe(28);
      expect(resultado.value.transacao.valorSubtotal).toBe(30);
      expect(resultado.value.transacao.valorDesconto).toBe(2);
      expect(resultado.value.transacao.valorTotal).toBe(29);
      expect(resultado.value.item.atualizadoEm).toEqual(DATA_TESTE);
    }
  });

  it("#1.2 - deve falhar quando transação não existe", async () => {
    const usecase = createFnAtualizarItemTransacao({ vendasRepositorio: criarVendasSimulacroRepositorio(), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-x", itemTransacaoId: "item-1" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando transação não permite edição", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ transacaoId: "trx-1", locatarioId: "loc-1", status: "CONCLUIDA" })] });
    const usecase = createFnAtualizarItemTransacao({ vendasRepositorio: repo, relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1", itemTransacaoId: "item-1" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando item não existe", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ transacaoId: "trx-1", locatarioId: "loc-1" })] });
    const usecase = createFnAtualizarItemTransacao({ vendasRepositorio: repo, relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1", itemTransacaoId: "item-x" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha ao atualizar item", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste()], itens: [criarItemTransacaoTeste()] });
    repo.simularFalha("atualizarItem");
    const usecase = createFnAtualizarItemTransacao({ vendasRepositorio: repo, relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1", itemTransacaoId: "item-1", quantidade: 2 });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
