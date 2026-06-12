// packages/core/__tests__/vendas/concluirTransacao.test.ts

import { describe, expect, it } from "vitest";
import { createFnConcluirTransacao } from "../../src/vendas/usecases/concluirTransacao";
import { criarMovimentacaoEstoqueFake } from "./fakes/vendasPortasFake";
import { criarIdPortaSequencial, DATA_TESTE, relogioTeste } from "./helpers/vendasUsecaseTestUtils";
import { criarItemTransacaoTeste, criarTransacaoTeste, criarVendasSimulacroRepositorio } from "./simulacros/vendasSimulacroRepositorio";

describe("#1 - createFnConcluirTransacao", () => {
  it("#1.1 - deve concluir transação aberta e movimentar estoque", async () => {
    const repo = criarVendasSimulacroRepositorio({
      transacoes: [criarTransacaoTeste({ status: "CONFIRMADA", tipo: "VENDA" })],
      itens: [criarItemTransacaoTeste({ movimentaEstoque: true, estoqueId: "est-1" })],
    });
    const movimentacaoEstoque = criarMovimentacaoEstoqueFake();
    const usecase = createFnConcluirTransacao({ vendasRepositorio: repo, movimentacaoEstoque, idPorta: criarIdPortaSequencial(["hist-1"]), relogio: relogioTeste });

    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1", usuarioId: "usr-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.transacao.status).toBe("CONCLUIDA");
      expect(resultado.value.transacao.atualizadoEm).toEqual(DATA_TESTE);
    }
    expect(movimentacaoEstoque.movimentos()).toHaveLength(1);
    expect(repo.dump().historico).toHaveLength(1);
  });

  it("#1.2 - deve concluir compra com movimento de ENTRADA", async () => {
    const repo = criarVendasSimulacroRepositorio({
      transacoes: [criarTransacaoTeste({ status: "CONFIRMADA", tipo: "COMPRA" })],
      itens: [criarItemTransacaoTeste({ movimentaEstoque: true, estoqueId: "est-1" })],
    });
    const movimentacaoEstoque = criarMovimentacaoEstoqueFake();
    const usecase = createFnConcluirTransacao({ vendasRepositorio: repo, movimentacaoEstoque, idPorta: criarIdPortaSequencial(["hist-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1" });
    expect(resultado.ok).toBe(true);
    expect((movimentacaoEstoque.movimentos()[0] as any).tipo).toBe("ENTRADA");
  });

  it("#1.3 - deve falhar quando transação não possui itens", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ status: "ABERTA" })] });
    const usecase = createFnConcluirTransacao({ vendasRepositorio: repo, idPorta: criarIdPortaSequencial(["hist-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando transição é inválida", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ status: "RASCUNHO" })], itens: [criarItemTransacaoTeste()] });
    const usecase = createFnConcluirTransacao({ vendasRepositorio: repo, idPorta: criarIdPortaSequencial(["hist-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha da movimentação de estoque", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ status: "CONFIRMADA" })], itens: [criarItemTransacaoTeste()] });
    const usecase = createFnConcluirTransacao({ vendasRepositorio: repo, movimentacaoEstoque: criarMovimentacaoEstoqueFake({ falhar: true }), idPorta: criarIdPortaSequencial(["hist-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1" });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
