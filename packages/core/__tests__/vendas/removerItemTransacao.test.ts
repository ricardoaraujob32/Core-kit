// packages/core/__tests__/vendas/removerItemTransacao.test.ts

import { describe, expect, it } from "vitest";
import { createFnRemoverItemTransacao } from "../../src/vendas/usecases/removerItemTransacao";
import { criarItemTransacaoTeste, criarTransacaoTeste, criarVendasSimulacroRepositorio } from "./simulacros/vendasSimulacroRepositorio";
import { DATA_TESTE, relogioTeste } from "./helpers/vendasUsecaseTestUtils";

describe("#1 - createFnRemoverItemTransacao", () => {
  it("#1.1 - deve remover item e recalcular totais da transação", async () => {
    const repo = criarVendasSimulacroRepositorio({
      transacoes: [criarTransacaoTeste({ transacaoId: "trx-1", locatarioId: "loc-1", valorAcrescimo: 1 })],
      itens: [
        criarItemTransacaoTeste({ itemTransacaoId: "item-1", transacaoId: "trx-1", locatarioId: "loc-1", quantidade: 1, valorUnitario: 10, valorDesconto: 0 }),
        criarItemTransacaoTeste({ itemTransacaoId: "item-2", transacaoId: "trx-1", locatarioId: "loc-1", quantidade: 2, valorUnitario: 5, valorDesconto: 1 }),
      ],
    });
    const usecase = createFnRemoverItemTransacao({ vendasRepositorio: repo, relogio: relogioTeste });

    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1", itemTransacaoId: "item-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.transacao.valorSubtotal).toBe(10);
      expect(resultado.value.transacao.valorDesconto).toBe(1);
      expect(resultado.value.transacao.valorTotal).toBe(10);
      expect(resultado.value.transacao.atualizadoEm).toEqual(DATA_TESTE);
    }
  });

  it("#1.2 - deve falhar quando transação não existe", async () => {
    const usecase = createFnRemoverItemTransacao({ vendasRepositorio: criarVendasSimulacroRepositorio(), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-x", itemTransacaoId: "item-1" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando transação não permite edição", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ status: "CONCLUIDA" })] });
    const usecase = createFnRemoverItemTransacao({ vendasRepositorio: repo, relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1", itemTransacaoId: "item-1" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando item não existe", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste()] });
    const usecase = createFnRemoverItemTransacao({ vendasRepositorio: repo, relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1", itemTransacaoId: "item-x" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha ao remover item", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste()], itens: [criarItemTransacaoTeste()] });
    repo.simularFalha("removerItem");
    const usecase = createFnRemoverItemTransacao({ vendasRepositorio: repo, relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1", itemTransacaoId: "item-1" });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
